// src/App.jsx
import React from "react";
import TodoList from "./components/TodoList";
import Notification from "./components/Notification";
import useTodoFormState from "./hooks/useTodoFormState";
import useTodoCrud from "./hooks/useTodoCrud";
import useTranslation from "./hooks/useTranslation";
import useNotification from "./hooks/useNotification";
import useAckee from "./hooks/useAckee";

const App = () => {
  
  const {trackEvent} = useAckee(ackeeServer, ackeeDomainId)

  const { todos, error, addTodo, updateTodo, deleteTodo } = useTodoCrud();
  const {
    text,
    isEditing,
    editId,
    setNewTodo,
    startEditing,
    cancelEditing,
    updateText,
    resetForm,
  } = useTodoFormState();
  const { t } = useTranslation();
  const { notification, isVisible, showNotification, clearNotification } =
    useNotification();

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    const success = await addTodo(text);
    if (success) {
      resetForm();
      showNotification("todoAdded");
    }
  };

  const handleUpdateTodo = async (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    const success = await updateTodo(editId, text);
    if (success) {
      resetForm();
      showNotification("todoUpdated");
    }
  };

  const handleDeleteTodo = async (id) => {
    const success = await deleteTodo(id);
    if (success) {
      showNotification("todoDeleted");
    }
  };

  const handleSubmit = (e) => {
    trackEvent("e627a9ac-bacf-4305-be05-369a1b985562", {
      key: "TodoCreated",
      value: 1,
    });
    e.preventDefault();
    if (isEditing) {
      handleUpdateTodo(e);
    } else {
      handleAddTodo(e);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
        {t("title")}
      </h1>
      {error}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={text}
            onChange={(e) => updateText(e.target.value)}
            className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={
              isEditing ? t("editTodoPlaceholder") : t("newTodoPlaceholder")
            }
          />
          <button
            type="submit"
            className={`${
              isEditing
                ? "bg-green-500 hover:bg-green-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4 rounded-r`}
          >
            {isEditing ? t("updateTodo") : t("addTodo")}
          </button>
        </div>
      </form>
      {isEditing && (
        <button
          onClick={cancelEditing}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded w-full mb-4"
        >
          {t("cancelEdit")}
        </button>
      )}
      <TodoList
        todos={todos}
        onEdit={startEditing}
        onDelete={handleDeleteTodo}
      />
      <Notification
        notification={notification}
        isVisible={isVisible}
        onClose={clearNotification}
      />
    </div>
  );
};

export default App;
