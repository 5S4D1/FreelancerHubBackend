const db = require('../DB/connect');

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
