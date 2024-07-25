import useErrorHandler from './useErrorHandler.js'

// /js/useTodoApi.js
const useTodoApi = () => {
    //const [error, setError] = React.useState('');
    const { error, handleError, clearError } = useErrorHandler();

    const handleResponse = async (response) => {
        if (!response.ok) {
            let errorMessage;
            let responseBody;

            // Read the response body as text
            responseBody = await response.text();

            try {
                // Attempt to parse the response as JSON
                const errorData = JSON.parse(responseBody);
                errorMessage = errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'API error';
            } catch (e) {
                // If parsing JSON fails, use the response body as is
                errorMessage = responseBody;
            }

            if (response.status === 429) {
                errorMessage = 'Too many requests. Please try again later.';
            }

            // Throw an error with the captured response data
            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;
            error.responseBody = responseBody;
            throw error;
        }
        return response.json();
    };

    const fetchTodos = async () => {
        try {
            const response = await fetch('/api/todos');
            clearError()
            return await handleResponse(response);
        } catch (err) {
            handleError(err)
            return [];
        }
    };

    const addTodo = async (text) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            clearError()
            return await handleResponse(response);
        } catch (err) {
            handleError(err)
            return null;
        }
    };

    const updateTodo = async (id, text) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            clearError()
            return await handleResponse(response);
        } catch (err) {
            handleError(err)
            return null;
        }
    };

    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
            });
            await handleResponse(response);
            clearError()
            return true;
        } catch (err) {
            handleError(err)
            return false;
        }
    };

    return {
        fetchTodos,
        addTodo,
        updateTodo,
        deleteTodo,
        error
    };
};

export default useTodoApi;
