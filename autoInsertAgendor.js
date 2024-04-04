// https://api.agendor.com.br/v3/funnels
// Authorization Token 419a935e-22ec-46aa-b42e-0ab293225556
// dealStages
// id: 3000255

const url = 'https://36a6-168-228-217-148.ngrok-free.app/';
// const url = 'https://sendagendor.olivehill.com.br/';
const token = '419a935e-22ec-46aa-b42e-0ab293225556';

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

const userId = getLocalStorageItem('userId');
const funnelIdLS = getLocalStorageItem('funnelId');
const cardIdLS = getLocalStorageItem('cardId');
const cardSequenceLS = getLocalStorageItem('cardSequence');

let funnelDealStages = [];

if (budget) {
    data.budget = budget.string;
}
if (clientName) {
    data.clientName = clientName.string;
}
if (servicePrice) {
    let price = servicePrice.string.replace(",00", "").replace(".", "");
    data.servicePrice = price;
}

insertEl(data)
action()
getMe()
getFunnel()
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
function getMe() {
    const route = 'api/me/';

    fetch(`${url}${route}${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            console.log(response)
            setLocalStorageItem('userId', response.data.accountId);
            setLocalStorageItem('user', { id: response.data.accountId, name: response.data.name });
        })
        .catch(error => {
            console.error('There was a problem with the fetch request:', error);
        });
}

function getFunnel() {
    const route = 'api/funnels/';

    fetch(`${url}${route}${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            console.log(response)
            const res = document.querySelector("#setFunnel");
            let options = '';

            response.data.forEach(el => {
                if (funnelIdLS == el.id) {
                    options += `<option value="${el.id}" selected>${el.name}</option>`;
                } else {
                    options += `<option value="${el.id}">${el.name}</option>`;
                }

                funnelDealStages.push({ "funnelId": el.id, "dealstages": el.dealStages })
            });
            res.innerHTML = `<select id="funnelId" style="width: 100%;">
                <option>Selecione um funil</option>
                ${options}
            </select>`;

            const selectFunnelCard = document.querySelector("#funnelId");
            if (selectFunnelCard) {
                if(funnelIdLS != null){
                    setCardElement(funnelIdLS);
                }
                selectFunnelCard.addEventListener('change', function (e) {
                    const funnelId = e.target.value;
                    setCardElement(funnelId);
                });
            }


        })
        .catch(error => {
            console.error('There was a problem with the fetch request:', error);
        });
}

function setCardElement(funnelId){
    const setCard = document.querySelector("#setCard");
    let optionsCard = '';
    setLocalStorageItem('funnelId', funnelId);
    funnelDealStages.forEach(fds => {
        if (fds.funnelId == funnelId) {
            fds.dealstages.forEach(fdsds => {
                if (cardIdLS == fdsds.id) {
                    optionsCard += `<option data-sequence="${fdsds.sequence}" value="${fdsds.id}" selected>${fdsds.name}</option>`;
                } else {
                    optionsCard += `<option data-sequence="${fdsds.sequence}"  value="${fdsds.id}">${fdsds.name}</option>`;
                }
            });
        }
    }); 
    
    setCard.innerHTML = `<select id="cardId" style="width: 100%;">
            <option>Selecione um card</option>
            ${optionsCard}
        </select>`;

    const selectCard = document.querySelector("#cardId");
    if (selectCard) {
        selectCard.addEventListener('change', function (el) {
            setLocalStorageItem('cardId', el.target.value);
            setLocalStorageItem('cardSequence', el.target.selectedOptions[0].dataset.sequence);
        })
    }
}

function action() {
    const route = 'api/organizations/';

    fetch(`${url}${route}${token}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(response => {
            const res = document.querySelector("#selecOrganization");
            let options = '';
            response.data.forEach(el => {
                if (checkOrganization(data.clientName, el.name)) {
                    options += `<option value="${el.id}" selected>${el.name}</option>`;
                } else {
                    options += `<option value="${el.id}">${el.name}</option>`;
                }
            });
            selectCard = ``
            res.innerHTML = `<select id="organizationId" style="width: 100%;">
                <option>Selecione uma empresa</option>
                ${options}
            </select>`
        })
        .catch(error => {
            console.error('There was a problem with the fetch request:', error);
        });
}

function insertEl(data) {
    document.querySelector("#orcamento_form > div.col-sm-3.form-buttons > div > div").insertAdjacentHTML("afterend", `
        <div style="display: flex;">
            <div>Funil:</div>
            <div id="setFunnel" style="width: 100%;"></div>
        </div>
        
        <div style="display: flex;">
            <div>Card:</div>
            <div id="setCard" style="width: 100%;"></div>
        </div>

        <div>
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
                <a id="btnSendToAgendor"
                    style="width: 100%;margin-top: 15px;text-align: left;border: 1px solid #ccc;background: #066914;color: #fff;padding: 7px 15px;"
                    id="saveAgendor"><span class="glyphicon glyphicon-plus"></span> Salvar Agendor</a>
            </div>
        </div>
    `);

    const btnSendToAgendor = document.querySelector("#btnSendToAgendor");
    if (btnSendToAgendor) {
        btnSendToAgendor.addEventListener('click', function (el) {
            sendAgendor();
        })
    }
}

function resSendAgendor(text) { document.querySelector("#resSendAgendor").innerHTML = `${text}`; }

function sendAgendor() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "title": document.querySelector("#cardName").value,
        "dealStatusText": "ongoing",
        "ownerUser": userId,
        "funnel": parseInt(funnelIdLS),
        "dealStage": parseInt(cardSequenceLS),
        "value": document.querySelector("#price").value.replace(",","."),
        "allowToAllUsers": true
    });
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    const route = 'api/organizations/' + document.querySelector("#organizationId").value + '/';

    if( isNumber(document.querySelector("#organizationId").value) && parseInt(funnelIdLS) != null && parseInt(cardSequenceLS) != null){
        fetch(`${url}${route}${token}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            if (result.errors) {
                resSendAgendor(result.errors[0])
            } else {
                resSendAgendor("Enviado com sucesso!")
            }
        })
        .catch((error) => console.error(error));
    }else{
        resSendAgendor("Deve preencher todos os campos corretamente!")
    }

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

// setLocalStorageItem('user', {id:1,name:"Marlon Braga"});
// setLocalStorageItem('funnel', {funnelId:1,funnelName:"Funil de vendas"});
// setLocalStorageItem('deal', {dealId:1,dealName:"Em contato",dealSequece:2});

// console.log([
//     getLocalStorageItem('user'),
//     getLocalStorageItem('funnel'),
//     getLocalStorageItem('deal'),
// ]);

// clearLocalStorage()