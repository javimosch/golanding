// src/hooks/useTodoCrud.js
import { useState, useEffect } from 'react';
import useTodoApi from './useTodoApi';
import useErrorHandler from './useErrorHandler';

const useTodoCrud = () => {
  const [todos, setTodos] = useState([]);
  const { error, handleError, clearError } = useErrorHandler();
  const todoApi = useTodoApi(handleError);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const fetchedTodos = await todoApi.fetchTodos();
    setTodos(fetchedTodos);
  };

  const addTodo = async (text) => {
    const addedTodo = await todoApi.addTodo(text);
    if (addedTodo) {
      setTodos([...todos, addedTodo]);
      clearError();
      return true;
    }
    return false;
  };

  const updateTodo = async (id, text) => {
    const updatedTodo = await todoApi.updateTodo(id, text);
    if (updatedTodo) {
      setTodos(todos.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      clearError();
      return true;
    }
    return false;
  };

  const deleteTodo = async (id) => {
    const isDeleted = await todoApi.deleteTodo(id);
    if (isDeleted) {
      setTodos(todos.filter(todo => todo._id !== id));
      clearError();
      return true;
    }
    return false;
  };

  return {
    todos,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    fetchTodos
  };
};

export default useTodoCrud;
