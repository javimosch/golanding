// src/components/TodoList.jsx
import React from 'react';
import TodoItem from './TodoItem';
import useTranslation from '../hooks/useTranslation';

const TodoList = ({ todos, onEdit, onDelete }) => {
  const { t } = useTranslation();

  if (todos.length === 0) {
    return <p className="text-center text-gray-500">{t('noTodos')}</p>;
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem 
          key={todo._id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TodoList;
