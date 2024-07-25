// src/hooks/useTodoFormState.js
import { useState } from 'react';

const useTodoFormState = (initialState = { text: '', isEditing: false, editId: null }) => {
  const [formState, setFormState] = useState(initialState);

  const setNewTodo = (text) => {
    setFormState({ text, isEditing: false, editId: null });
  };

  const startEditing = (todo) => {
    setFormState({ text: todo.text, isEditing: true, editId: todo._id });
  };

  const cancelEditing = () => {
    setFormState({ text: '', isEditing: false, editId: null });
  };

  const updateText = (text) => {
    setFormState(prevState => ({ ...prevState, text }));
  };

  const resetForm = () => {
    setFormState({ text: '', isEditing: false, editId: null });
  };

  return {
    text: formState.text,
    isEditing: formState.isEditing,
    editId: formState.editId,
    setNewTodo,
    startEditing,
    cancelEditing,
    updateText,
    resetForm
  };
};

export default useTodoFormState;
