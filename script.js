const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const closeBtn = document.getElementById('closeBtn');
const itemForm = document.getElementById('itemForm');
const inventoryGrid = document.getElementById('inventoryGrid');
const searchInput = document.getElementById('searchInput');

const totalItemsEl = document.getElementById('totalItems');
const totalValueEl = document.getElementById('totalValue');
const lowStockEl = document.getElementById('lowStock');

let inventory = [];
let count = 1;
let editId = null;


let ctx = document.getElementById('categoryChart').getContext('2d');
let categoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Category Value',
            data: [],
            backgroundColor: '#3b82f6'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Inventory Value per Category' }
        },
        scales: { y: { beginAtZero: true } }
    }
});


addItemBtn.addEventListener('click', () => itemModal.classList.remove('hidden'));
closeBtn.addEventListener('click', () => itemModal.classList.add('hidden'));
window.addEventListener('click', e => { if(e.target === itemModal) itemModal.classList.add('hidden'); });


itemForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const price = parseFloat(document.getElementById('itemPrice').value);

    if(editId){
        const item = inventory.find(i => i.id === editId);
        item.name = name;
        item.category = category;
        item.quantity = quantity;
        item.price = price;
        editId = null;
    } else {
        inventory.push({id: count++, name, category, quantity, price});
    }

    renderInventory(inventory);
    itemForm.reset();
    itemModal.classList.add('hidden');
});


function renderInventory(items){
    inventoryGrid.innerHTML = '';
    let totalValue = 0;
    let lowStock = 0;
    let categoryValues = {};

    items.forEach(item => {
        totalValue += item.price * item.quantity;
        if(item.quantity < 5) lowStock++;

        categoryValues[item.category] = (categoryValues[item.category] || 0) + (item.price * item.quantity);

        const card = document.createElement('div');
        card.className = `bg-white rounded-xl shadow-lg p-5 flex flex-col hover:shadow-2xl transition ${item.quantity<5?'border-2 border-red-400':''}`;
        card.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${item.name}</h3>
            <p class="text-gray-500 mb-1">Category: ${item.category}</p>
            <p class="text-gray-500 mb-1">Quantity: ${item.quantity}</p>
            <p class="text-gray-500 mb-3">Price: $${item.price}</p>
            <div class="flex gap-2">
                <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onclick="editItem(${item.id})">Edit</button>
                <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `;
        inventoryGrid.appendChild(card);
    });

    totalItemsEl.textContent = items.length;
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    lowStockEl.textContent = lowStock;

    categoryChart.data.labels = Object.keys(categoryValues);
    categoryChart.data.datasets[0].data = Object.values(categoryValues);
    categoryChart.update();
}

function deleteItem(id){
    inventory = inventory.filter(i => i.id !== id);
    renderInventory(inventory);
}
function editItem(id){
    const item = inventory.find(i => i.id === id);
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemPrice').value = item.price;
    editId = id;
    itemModal.classList.remove('hidden');
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = inventory.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.category.toLowerCase().includes(query)
    );
    renderInventory(filtered);
});