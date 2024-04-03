// https://api.agendor.com.br/v3/funnels
// Authorization Token 419a935e-22ec-46aa-b42e-0ab293225556
// dealStages
// id: 3000255


let infosHeader = document.querySelector("#orcamento_form > div.col-sm-9.form-fields > div > div > fieldset:nth-child(1) > div.field-boxes.row > div:nth-child(1) > div > p")
let arrInfosHeader = infosHeader.innerText.split("\n")
function findInfo(array, substring) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].includes(substring)) {
            return { string: array[i].split(substring)[1], posição: i };
        }
    }
    return null;
}
let budget = findInfo(arrInfosHeader, "Orçamento: ");
let clientName = findInfo(arrInfosHeader, "Cliente: ");
let servicePrice = findInfo(arrInfosHeader, "Valor total deste orçamento: R$ ");

let data = {};

if (budget) {
    // console.log(`${budget.string}`);
    data.budget = budget.string;
}
if (clientName) {
    // console.log(`${clientName.string}`);
    data.clientName = clientName.string;
}
if (servicePrice) {
    let price = servicePrice.string.replace(",00", "").replace(".", "");
    // console.log(`${price}`);
    data.servicePrice = price;
}

insertEl(data)
action()
function action() {
    const url = 'https://6795-168-228-217-148.ngrok-free.app/';
    const route = 'api/organizations/';
    const token = '419a935e-22ec-46aa-b42e-0ab293225556';

    fetch(`${url}${route}${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            const res = document.querySelector("#selecOrganization");
            console.log(res, response)
            let options = '';
            response.data.forEach(el => {
                if (checkOrganization(data.clientName, el.name)) {
                    options += `<option value="${el.id}" selected>${el.name}</option>`;
                } else {
                    options += `<option value="${el.id}">${el.name}</option>`;
                }
            });
            res.innerHTML = `<select id="organizationId" style="width: 100%;">${options}</select>`
        })
        .catch(error => {
            console.error('There was a problem with the fetch request:', error);
        });
}

function insertEl(data) {
    document.querySelector("#orcamento_form > div.col-sm-3.form-buttons > div > div").insertAdjacentHTML("afterend", `<div>
    <div style="display: flex;">
    <div>Titulo:</div>
    <div style="width: 100%;">
        <input style="width: 100%;" type="text" id="cardName" value="${data.clientName} - ${data.budget}">
    </div>
</div>

<div style="display: flex;">
    <div>Valor:</div>
    <div style="width: 100%;">
        <input style="width: 100%;" type="text" id="price" value="${data.servicePrice}">
    </div>
</div>
<div style="display: flex;">
    <div>Empresa:</div>
    <div id="selecOrganization" style="width: 100%;"></div>
</div>
<div style="display: flex; margin:10px 0;" id="resSendAgendor"></div>

<div style="display: flex;">
    <a onclick="sendAgendor()" style="width: 100%;margin-top: 15px;text-align: left;border: 1px solid #ccc;background: #066914;color: #fff;padding: 7px 15px;" id="saveAgendor"><span class="glyphicon glyphicon-plus"></span> Salvar Agendor</a>
</div>
    
    </div>`)
}


function resSendAgendor(text) {
    const el = document.querySelector("#resSendAgendor");
    el.innerHTML = `${text}`;
    console.log(el)
}
function sendAgendor() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "title": document.querySelector("#cardName").value,
        "dealStatusText": "ongoing",
        "ownerUser": 667894,
        "funnel": 732836,
        "dealStage": 2,
        "value": document.querySelector("#price").value,
        "allowToAllUsers": true
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    const url = 'https://6795-168-228-217-148.ngrok-free.app/';
    const route = 'api/organizations/' + document.querySelector("#organizationId").value + '/';
    const token = '419a935e-22ec-46aa-b42e-0ab293225556';

    fetch(`${url}${route}${token}`, requestOptions)
        // fetch("https://api.agendor.com.br/v3/organizations/"+document.querySelector("#organizationId").value+"/deals", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            if(result.errors){
                console.log("error")
                resSendAgendor(result.errors[0])
            }else{
                resSendAgendor("Enviado com sucesso!")
            }
            console.log(result);
        })
        .catch((error) => console.error(error));
}
function checkOrganization(orgSGQ, orgAgendor) {
    if (orgSGQ.indexOf(orgAgendor) !== -1) {
        return true;
    } else {
        if (orgAgendor.indexOf(orgSGQ) !== -1) {
            return true;
        } else {
            return false;
        }
    }
}

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorageItem(key) {
    var value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

function removeLocalStorageItem(key) {
    localStorage.removeItem(key);
}

function clearLocalStorage() {
    localStorage.clear();
}

