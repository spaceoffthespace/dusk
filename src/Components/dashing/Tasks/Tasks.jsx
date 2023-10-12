import React, { useState } from 'react';
import {
  Container,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { AddCircle, Edit, Delete } from '@mui/icons-material';

import './Tasks.css'

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    earnings: 0,
    price: 0,
    task_type: '',
    status: 'pending',
    // Add more fields as needed
    // image: null,
  });

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTask(null);
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddTask = () => {
    // Implement your logic to add a new task
    const newTask = { ...taskFormData };
    // Call the API to add the new task
    // ...

    // Update the tasks state with the new task
    setTasks((prevTasks) => [...prevTasks, newTask]);

    // Reset the form data after adding the task
    setTaskFormData({
      name: '',
      earnings: 0,
      price: 0,
      task_type: '',
      status: 'pending',
      // Add more fields as needed
      // image: null,
    });
  };

  const handleEditTask = () => {
    // Implement your logic to edit an existing task
    // ...

    // Update the tasks state with the edited task
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === selectedTask.id ? { ...task, ...taskFormData } : task
      )
    );

    // Close the dialog
    handleCloseDialog();
  };

  const handleDeleteTask = () => {
    // Implement your logic to delete a task
    // ...

    // Update the tasks state by removing the deleted task
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== selectedTask.id)
    );

    // Close the dialog
    handleCloseDialog();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Task Name', flex: 1 },
    // Add more columns as needed
    // ...
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div>
          <IconButton color="primary" onClick={() => handleOpenDialog(params.row)}>
            <Edit />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDeleteTask(params.row.id)}>
            <Delete />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" className="task-container">    <Grid container spacing={2}>
      {/* Task Form */}
      <Grid item xs={12} md={6}>
        <form className="task-form">
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <TextField
                name="name"
                value={taskFormData.name}
                onChange={handleChange}
                label="Task Name"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Add more fields for task form */}
            <Grid item xs={12}>
              <TextField
                name="earnings"
                value={taskFormData.earnings}
                onChange={handleChange}
                label="Earnings"
                type="number"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="price"
                value={taskFormData.price}
                onChange={handleChange}
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="task_type"
                value={taskFormData.task_type}
                onChange={handleChange}
                label="Task Type"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Add more fields as needed */}
            {/* <input type="file" onChange={handleImageChange} /> */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleAddTask}>
                Add Task
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>

      {/* Task List */}
      <Grid item xs={12} md={6}>
        <div className="task-grid">
          <DataGrid rows={tasks} columns={columns} pageSize={5} />
        </div>
      </Grid>
    </Grid>

    {/* Edit Task Dialog */}
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        {/* Display the selected task details in the dialog */}
        <form className="task-form">
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <TextField
                name="name"
                value={taskFormData.name}
                onChange={handleChange}
                label="Task Name"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Add more fields for task form */}
            <Grid item xs={12}>
              <TextField
                name="earnings"
                value={taskFormData.earnings}
                onChange={handleChange}
                label="Earnings"
                type="number"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="price"
                value={taskFormData.price}
                onChange={handleChange}
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="task_type"
                value={taskFormData.task_type}
                onChange={handleChange}
                label="Task Type"
                fullWidth
                variant="outlined"
              />
            </Grid>
            {/* Add more fields as needed */}
            {/* <input type="file" onChange={handleImageChange} /> */}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditTask} color="primary">
          Save Changes
        </Button>
        <Button onClick={handleCloseDialog} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
  );
};

export default Task;
