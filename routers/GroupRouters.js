import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = Router();

router.post("/api/v1/courses/:courseId/groups", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { groupName, memberIds } = req.body;

    if (!groupName || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Group name and at least one member are required.",
      });
    }

    const [groupResult] = await pool.query(
      `INSERT INTO student_groups (course_id, group_name, created_by)
       VALUES (?, ?, ?)`,
      [courseId, groupName, req.user.id],
    );

    const groupId = groupResult.insertId;

    for (const studentId of memberIds) {
      await pool.query(
        `INSERT INTO group_members (group_id, student_id)
         VALUES (?, ?)`,
        [groupId, studentId],
      );
    }

    res.status(201).json({
      status: 201,
      message: "Group created successfully",
      data: {
        groupId,
        courseId: Number(courseId),
        groupName,
        memberIds,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Failed to create group.",
    });
  }
});

router.get("/api/v1/courses/:courseId/groups", auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        sg.group_id AS groupId,
        sg.group_name AS groupName,
        u.user_id AS studentId,
        u.full_name AS studentName,
        u.email AS studentEmail
      FROM student_groups sg
      LEFT JOIN group_members gm ON sg.group_id = gm.group_id
      LEFT JOIN users u ON gm.student_id = u.user_id
      WHERE sg.course_id = ?
      ORDER BY sg.group_id
      `,
      [courseId],
    );

    const groups = {};

    for (const row of rows) {
      if (!groups[row.groupId]) {
        groups[row.groupId] = {
          groupId: row.groupId,
          groupName: row.groupName,
          members: [],
        };
      }

      if (row.studentId) {
        groups[row.groupId].members.push({
          studentId: row.studentId,
          name: row.studentName,
          email: row.studentEmail,
        });
      }
    }

    res.status(200).json({
      status: 200,
      message: "Groups retrieved successfully",
      data: Object.values(groups),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve groups.",
    });
  }
});

export default router;
