const db = require('../DB/connect');
const { v4: uuidv4 } = require('uuid');

// Create Task
exports.createTask = async (req, res) => {
  const { freelancer_id, title, description, category_id, delivery_days } = req.body;

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO tasks (id, freelancer_id, title, description, category_id, delivery_days, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [id, freelancer_id, title, description, category_id, delivery_days || 3]
    );

    res.status(201).json({ message: 'Task created successfully', task_id: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
};

// Get Tasks
exports.getTasks = async (req, res) => {
  try {
    const [tasks] = await db.query('SELECT id, title, freelancer_id, status FROM tasks');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
};

// not complete - this is for linking a project to a task, which is needed for the bidding process.
exports.addProjectToTask = async (req, res) => {
    const { taskId } = req.params;
    const { project_id } = req.body;

    try {
        // Ensure task exists
        const [task] = await db.query('SELECT freelancer_id FROM tasks WHERE id = ?', [taskId]);
        if (!task.length) return res.status(404).json({ error: 'Task not found' });

        // Ensure project exists
        const [project] = await db.query('SELECT id FROM projects WHERE id = ?', [project_id]);
        if (!project.length) return res.status(404).json({ error: 'Project not found' });

        // Link project to task via task_packages table
        await db.query(
            'INSERT INTO task_packages (task_id, project_id) VALUES (?, ?)',
            [taskId, project_id]
        );

        console.log(`Project ${project_id} linked to Task ${taskId}`);
        res.json({
            message: 'Project linked to task successfully'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to link project', details: err.message });
    }
};
