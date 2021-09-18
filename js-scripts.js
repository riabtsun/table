let data = []
let currentPage = 1
let perPage = 20
let search = null

const tableColumns = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  state: ['adress', 'state'],
}

async function loadData() {
  const response = await fetch('https://itrex-react-lab-files.s3.eu-central-1.amazonaws.com/react-test-api.json')
  return await response.json()
}

function getFromObject(item, path) {
  if (Array.isArray(path)) {
    let value = item
    for (const part of path) {
      if (!!value[part]) {
        value = value[part]
      } else {
        value = null;
        break;
      }
    }
    return value
  } else {
    return item[path]
  }
}

function clearTable() {
  const tBody = document.querySelector('.info__wrapper table tbody');
  tBody.innerHTML = null;
}

function renderTable(content) {
  const tBody = document.querySelector('.info__wrapper table tbody');

  if (!content || !content.length) {
    const headersCount = document.querySelectorAll('table thead th').length;
    const tr = document.createElement('tr');
    tr.setAttribute('colspan', headersCount + 1)
    tr.innerText = 'No data'

    tBody.appendChild(tr)
    return
  }

  for (const item of content) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', item.id);

    for (const [key, path] of Object.entries(tableColumns)) {
      const td = document.createElement('td');
      td.innerText = getFromObject(item, path);

      tr.appendChild(td)
    }

    tr.addEventListener('click', (event) => {
      const rowId = parseInt(event.target.parentNode.dataset.id)

      const contentRow = content.find(({ id }) => id === rowId)
      if (contentRow) {
        const dataDiv = document.createElement('div');
        dataDiv.innerHTML = `<span>Profile info:</span>
        <span>Selected profile: ${contentRow.firstName} ${contentRow.lastName}</span> 
        <span>Description: ${contentRow.description}</span> 
        <span> Address: ${contentRow.adress.streetAddress}</span> 
        <span>City: ${contentRow.adress.city}</span>  
        <span>State: ${contentRow.adress.state}</span> 
        <span>Index: ${contentRow.adress.zip}</span>`

        const infoBlock = document.querySelector('.additional_info');
        infoBlock.innerHTML = null;
        infoBlock.appendChild(dataDiv);
      }
    })

    tBody.appendChild(tr)
  }
}

function paginate(data, page = 1, perPage = 20) {
  const starts = (page - 1) * perPage

  return [...data].splice(starts, perPage)
}

function refreshData(data) {
  let filteredData = data

  if (search) {
    filteredData = data.filter(item => {
      return item.firstName.toLowerCase().includes(search)
        || item.lastName.toLowerCase().includes(search);
    });
  }

  const paginatedData = paginate(filteredData, currentPage, perPage)

  clearTable();
  renderTable(paginatedData)
}

async function init() {
  data = await loadData()
  data = data.sort((a, b) => a.id - b.id) // sort by id



  refreshData(data)
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.search_input')
    .addEventListener('keyup', (event) => {
      search = event.target.value.toLowerCase();
      refreshData(data)
    })

  document.querySelectorAll('.pagination a')
    .forEach((paginationPage) => {
      paginationPage.addEventListener('click', event => {
        event.preventDefault();
        const newPage = parseInt(event.target.dataset.page);
        if (newPage !== currentPage) {
          currentPage = newPage;
          refreshData(data);
        }
      })
    })
});

init()

