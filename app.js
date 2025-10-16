
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const todoList = document.getElementById('todo-list');
const addTodoForm = document.getElementById('add-todo-form');
const todoInput = document.getElementById('todo-input');

// Todoをすべて取得して表示
const fetchTodos = async () => {
    const { data: todos, error } = await supabaseClient
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching todos:', error);
        return;
    }

    todoList.innerHTML = ''; // リストをクリア
    todos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });
};

// Todo要素を作成
const createTodoElement = (todo) => {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    if (todo.is_completed) {
        li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.is_completed;
    checkbox.addEventListener('change', () => toggleComplete(todo.id, !todo.is_completed));

    const span = document.createElement('span');
    span.textContent = todo.task;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    return li;
};

// Todoを追加
addTodoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (!task) return;

    const { data, error } = await supabaseClient
        .from('todos')
        .insert([{ task: task, is_completed: false }])
        .select();

    if (error) {
        console.error('Error adding todo:', error);
        return;
    }
    
    if (data && data.length > 0) {
        const newTodo = data[0];
        const li = createTodoElement(newTodo);
        todoList.prepend(li); // 新しいタスクをリストの先頭に追加
    }

    todoInput.value = '';
});

// Todoの完了状態を切り替え
const toggleComplete = async (id, is_completed) => {
    const { error } = await supabaseClient
        .from('todos')
        .update({ is_completed: is_completed })
        .eq('id', id);

    if (error) {
        console.error('Error updating todo:', error);
    } else {
        const li = document.querySelector(`li[data-id='${id}']`);
        li.classList.toggle('completed');
    }
};

// Todoを削除
const deleteTodo = async (id) => {
    const { error } = await supabaseClient
        .from('todos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting todo:', error);
    } else {
        const li = document.querySelector(`li[data-id='${id}']`);
        li.remove();
    }
};

// 初期表示
fetchTodos();