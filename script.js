function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// State
let sections = [
    { id: generateId(), title: "Living/Dining", rows: [{ id: generateId(), item: "", h: 0, w: 0, price: 0, isFixed: false }] },
    { id: generateId(), title: "Master Bedroom", rows: [{ id: generateId(), item: "", h: 0, w: 0, price: 0, isFixed: false }] },
    { id: generateId(), title: "Children's Bedroom", rows: [{ id: generateId(), item: "", h: 0, w: 0, price: 0, isFixed: false }] },
    { id: generateId(), title: "Kitchen", rows: [{ id: generateId(), item: "", h: 0, w: 0, price: 0, isFixed: false }] },
    { id: generateId(), title: "Pooja Room", rows: [{ id: generateId(), item: "", h: 0, w: 0, price: 0, isFixed: false }] }
];

let additionalCosts = [];

let negotiationAmount = 0;

// Common interior items for autocomplete
const itemSuggestions = [
    "Arch Panel",
    "Bedroom Door",
    "Book Shelf",
    "Console Table",
    "Crockery Unit",
    "Dressing Table",
    "Dresser",
    "False Ceiling",
    "Kitchen Breakfast Counter",
    "Kitchen Cabinet",
    "Kitchen entrance frame",
    "Loft",
    "Main door wooden panel",
    "Over Head Box",
    "Partition",
    "Pooja Box",
    "Pooja Mandir",
    "Pooja Unit",
    "Shoe Box",
    "Side Table",
    "Sliding Door",
    "Study Table",
    "TV Back Panel",
    "TV Unit",
    "Wall Panel",
    "Wardrobe",
    "Wooden wicker basket"
];

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Create datalist for autocomplete
    const datalist = document.createElement('datalist');
    datalist.id = 'item-suggestions';
    itemSuggestions.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);

    // Load saved data from localStorage
    loadFromLocalStorage();

    // Save customer name on change
    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) {
        customerNameEl.addEventListener('input', saveToLocalStorage);
        customerNameEl.addEventListener('blur', saveToLocalStorage);
    }

    render();
});

// Save to localStorage
function saveToLocalStorage() {
    const data = {
        sections: sections,
        additionalCosts: additionalCosts,
        negotiationAmount: negotiationAmount,
        customerName: document.getElementById('customerName')?.textContent || ''
    };
    localStorage.setItem('quotationData_v3', JSON.stringify(data));
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('quotationData_v3');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            sections = data.sections || sections;
            additionalCosts = data.additionalCosts || additionalCosts;
            negotiationAmount = data.negotiationAmount || 0;

            // Restore customer name
            if (data.hasOwnProperty('customerName')) {
                setTimeout(() => {
                    const customerNameEl = document.getElementById('customerName');
                    if (customerNameEl) {
                        customerNameEl.textContent = data.customerName;
                    }
                }, 100);
            }

            // Restore negotiation amount
            setTimeout(() => {
                const negotiationInput = document.getElementById('negotiation-amount');
                if (negotiationInput) {
                    negotiationInput.value = negotiationAmount;
                }
            }, 100);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function render() {
    const container = document.getElementById('quotation-content');
    container.innerHTML = '';

    let grandTotal = 0;

    sections.forEach((section, sIndex) => {
        let sectionTotal = 0;

        const sectionEl = document.createElement('div');
        sectionEl.className = 'quotation-section';

        sectionEl.innerHTML = `
            <div class="section-header">
                <input type="text" class="section-title-input" value="${section.title}" onchange="updateSectionTitle(${sIndex}, this.value)">
                <button class="btn-danger no-print" style="position:absolute; right:5px; top:5px;" onclick="removeSection(${sIndex})"><i class="fas fa-trash"></i></button>
            </div>
            <table class="q-table">
                <thead>
                    <tr>
                        <th class="col-item">ITEM</th>
                        <th class="col-dim">HEIGHT</th>
                        <th class="col-dim">WIDTH</th>
                        <th class="col-area">AREA (SFT)</th>
                        <th class="col-price">PRICE</th>
                        <th class="col-total">TOTAL</th>
                        <th class="col-action no-print"></th>
                    </tr>
                </thead>
                <tbody id="tbody-${section.id}">
                </tbody>
            </table>
            <div class="section-total">
                TOTAL: <span id="total-${section.id}">0.0</span>
            </div>
            <div class="text-right no-print" style="margin-top: 5px;">
                <button class="btn btn-secondary" style="font-size:0.8rem; padding: 4px 8px;" onclick="addRow(${sIndex})">+ Add Item</button>
            </div>
        `;

        container.appendChild(sectionEl);

        const tbody = sectionEl.querySelector(`#tbody-${section.id}`);

        section.rows.forEach((row, rIndex) => {
            let area = 0;
            if (row.h && row.w) {
                area = (row.h * row.w) / 144;
            } else if (row.area) {
                area = row.area;
            }

            let total = 0;
            if (row.isFixed) {
                total = row.price;
                area = row.area || 0;
            } else {
                total = area * row.price;
            }

            sectionTotal += total;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-item">
                    <input type="text" value="${row.item}" list="item-suggestions" onchange="updateRow(${sIndex}, ${rIndex}, 'item', this.value)">
                </td>
                <td class="col-dim"><input type="number" value="${row.h || ''}" placeholder="0" onchange="updateRow(${sIndex}, ${rIndex}, 'h', this.value)"></td>
                <td class="col-dim"><input type="number" value="${row.w || ''}" placeholder="0" onchange="updateRow(${sIndex}, ${rIndex}, 'w', this.value)"></td>
                <td class="col-area">${area > 0 ? area.toFixed(2) : '-'}</td>
                <td class="col-price"><input type="number" value="${row.price}" onchange="updateRow(${sIndex}, ${rIndex}, 'price', this.value)"></td>
                <td class="col-total">${total.toFixed(1)}</td>
                <td class="col-action no-print">
                    <button class="btn-danger" onclick="removeRow(${sIndex}, ${rIndex})">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById(`total-${section.id}`).innerText = sectionTotal.toFixed(1);
        grandTotal += sectionTotal;
    });

    document.getElementById('grand-total').innerText = grandTotal.toFixed(1);
    renderAdditionalCosts(grandTotal);
}

function renderAdditionalCosts(baseTotal) {
    const container = document.getElementById('additional-costs');
    container.innerHTML = '';

    let extraTotal = 0;

    additionalCosts.forEach((cost, index) => {
        extraTotal += parseFloat(cost.value);
        const div = document.createElement('div');
        div.className = 'cost-row';
        div.innerHTML = `
            <div class="label" style="background:white; color:#333; width:auto; border:none;">
                <input type="text" class="cost-name" value="${cost.name}" onchange="updateCost(${index}, 'name', this.value)">
            </div>
            <div class="value" style="background:white; border:none;">
                <input type="number" class="cost-value" value="${cost.value}" onchange="updateCost(${index}, 'value', this.value)">
            </div>
            <div class="no-print" style="display:flex; align-items:center; padding:0 5px;">
                 <button class="btn-danger" onclick="removeCost(${index})">&times;</button>
            </div>
        `;
        container.appendChild(div);
    });

    const finalAmount = baseTotal + extraTotal - negotiationAmount;
    document.getElementById('final-amount').innerText = finalAmount.toFixed(1);
}

function updateNegotiation(val) {
    negotiationAmount = parseFloat(val) || 0;
    render();
    saveToLocalStorage();
}

function handleAddSection() {
    const select = document.getElementById('sectionTypeSelect');
    let title = select.value;

    if (title === 'Custom') {
        const customName = prompt("Enter section name:", "New Section");
        if (!customName) return;
        title = customName;
    }

    addSection(title);
}

function addSection(title = "New Section Title") {
    sections.push({
        id: generateId(),
        title: title,
        rows: [
            { id: generateId(), item: "New Item", h: 0, w: 0, price: 0, isFixed: false }
        ]
    });
    render();
    saveToLocalStorage();
}

function removeSection(index) {
    if (confirm('Delete this entire section?')) {
        sections.splice(index, 1);
        render();
        saveToLocalStorage();
    }
}

function updateSectionTitle(index, val) {
    sections[index].title = val;
    saveToLocalStorage();
}

function addRow(sectionIndex) {
    sections[sectionIndex].rows.push({
        id: generateId(),
        item: "",
        h: 0,
        w: 0,
        price: 0,
        isFixed: false
    });
    render();
    saveToLocalStorage();
}

function removeRow(sIndex, rIndex) {
    sections[sIndex].rows.splice(rIndex, 1);
    render();
    saveToLocalStorage();
}

function updateRow(sIndex, rIndex, field, val) {
    const row = sections[sIndex].rows[rIndex];
    if (field === 'h' || field === 'w' || field === 'price') {
        row[field] = parseFloat(val) || 0;
    } else {
        row[field] = val;
    }
    render();
    saveToLocalStorage();
}

function addAdditionalCost() {
    additionalCosts.push({ id: generateId(), name: "New Cost", value: 0 });
    render();
    saveToLocalStorage();
}

function updateCost(index, field, val) {
    if (field === 'value') {
        additionalCosts[index].value = parseFloat(val) || 0;
    } else {
        additionalCosts[index].name = val;
    }
    render();
    saveToLocalStorage();
}

function removeCost(index) {
    additionalCosts.splice(index, 1);
    render();
    saveToLocalStorage();
}

// PDF Generation
function generatePDF() {
    const element = document.getElementById('quotation-paper');

    const inputs = element.querySelectorAll('input');
    inputs.forEach(input => {
        input.setAttribute('value', input.value);
    });

    const customerNameEl = document.getElementById('customerName');
    let customerName = customerNameEl.textContent.trim() || 'Quotation';

    customerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${customerName}_Quotation.pdf`;

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    });
}
