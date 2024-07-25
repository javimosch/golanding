// src/components/TodoItem.jsx
import React, { useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import ConfirmationDialog from './ConfirmationDialog';

const TodoItem = ({ todo, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(todo._id);
    setIsConfirmOpen(false);
  };

  return (
    <li className="flex items-center justify-between bg-white p-4 rounded shadow mb-2">
      <span className="text-gray-800 break-all mr-4">{todo.text}</span>
      <div className="flex-shrink-0">
        <button 
          onClick={() => onEdit(todo)} 
          className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition duration-200"
          aria-label={`Edit todo: ${todo.text}`}
        >
          {t('editTodo')}
        </button>
        <button 
          onClick={handleDeleteClick} 
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
          aria-label={`Delete todo: ${todo.text}`}
        >
          {t('deleteTodo')}
        </button>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message={t('confirmDeleteTodo', { todo: todo.text })}
      />
    </li>
  );
};

export default TodoItem;
