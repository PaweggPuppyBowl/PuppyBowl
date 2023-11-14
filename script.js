const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2308-acc-pt-web-pt-b';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

const state = [];
const newPlayerForm = document.getElementById("new-player-form");
const config = ["name", "breed", "status", "imageUrl", "teamId"];

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    const endPoint = 'players';
    const currentApi = APIURL + endPoint;
    try {
        let request = await fetch(currentApi);
        let data = await request.json(); 
        return data.data.players;
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const showDetails = async (playerId) => {
    let div = document.querySelectorAll(`.player-${playerId} > p`)
    div.forEach(x => {
        x.toggleAttribute("Hidden");
    });
    let button = document.querySelector(`#detail-${playerId}`);
    if (button.textContent == "See Details") {
        button.textContent = "Hide Details";
    } else {
        button.textContent = "See Details";
    }
}

// const fetchSinglePlayer = async (playerId) => {
//     try {
//         for(let player of state.players){
//             if (player.id == playerId) {
//                 let html = `
//                 <p>Breed: ${player.breed}</p>
//                 <p>${player.status}</p>
//                 <p>${player.teamId}</p>
//                 `;
//                 return html;
//             }
//         }
//         throw err;
//     } catch (err) {
//         console.error(`Oh no, trouble fetching player #${playerId}!`, err);
//     }
// };

const formSubmitted = async () => {
    //make playerObj
    try {
        let playerObj = {};
        for (const item of config) {
            playerObj[item] = document.getElementById(`form-${item}`).value;
            if (!playerObj[item]) {
                throw new Error(`${item} must be filled in.`);
            }
        }
        if (playerObj.status != "field" && playerObj.status != "bench") {
            console.log(playerObj.status);
            throw new Error(`Status must be "field" or "bench".`);
        }
        if (typeof(parseInt(playerObj.teamId)) != "number") {
            console.log(typeof(playerObj.teamId));
            throw new Error(`TeamId must be a number.`)
        }
        addNewPlayer(playerObj);
    } catch (err) {
        console.error(err);
    }
}

const addNewPlayer = async (playerObj) => {
    try {
        const response = await fetch(
            APIURL + "players",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(playerObj),
            }
        );
        const result = await response.json();
        console.log(result);
        state.players = await fetchAllPlayers();
        renderAllPlayers(state.players);
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        console.log(`Trying to remove player id ${playerId}`);
        const response = fetch(APIURL + "players/" + playerId,
        {method: "DELETE"}
        );
        const result = (await response).json();
        console.log(result);
        state.players = await fetchAllPlayers();
        renderAllPlayers(state.players);
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

/**
    * It takes an array of player objects, loops through them, and creates a string of HTML for each
    * player, then adds that string to a larger string of HTML that represents all the players. 
    * 
    * Then it takes that larger string of HTML and adds it to the DOM. 
    * 
    * It also adds event listeners to the buttons in each player card. 
    * 
    * The event listeners are for the "See details" and "Remove from roster" buttons. 
    * 
    * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
    * API to get the details for a single player. 
    * 
    * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
    * the API to remove a player from the roster. 
    * 
    * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
    * @param playerList - an array of player objects
    * @returns the playerContainerHTML variable.
    */
    const renderAllPlayers = (playerList) => {
        const playersContainer = document.getElementById("all-players-container");
        playersContainer.innerHTML = "";
        try {
            for(let player of playerList){
                const playerDiv = document.createElement("div");
                playerDiv.classList.add(`player-${player.id}`);

                // player object
                // keys: id, name, breed, status, imageUrl, createdAt, updatedAt, teamId, cohortId
                playerDiv.innerHTML = `
                    <h3> ${player.name} </h3>
                    <image src="${player.imageUrl}">
                    <p Hidden>Breed: ${player.breed}</p>
                    <p Hidden>Status: ${player.status}</p>
                    <p Hidden>Team: ${player.teamId}</p>
                    <button id="detail-${player.id}" onclick="showDetails(${player.id})">See Details</button>
                    <button id="remove-${player.id}" onclick="removePlayer(${player.id})">Remove From Roster</button>
                    `;

                playersContainer.appendChild(playerDiv);
            }
        } catch (err) {
            console.error('Uh oh, trouble rendering players!', err);
        }
    };


/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {

        let form = document.createElement("form");

        for (const item of config) {
            let itemLabel = document.createElement("label");
            let itemInput = document.createElement("input");
            itemInput.setAttribute("id", `form-${item}`);
            itemLabel.innerText = `${item}: `;
            itemLabel.appendChild(itemInput);
            form.appendChild(itemLabel);
        }
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.addEventListener("click", formSubmitted);
        button.innerText = "Add Player";
        form.appendChild(button);
        newPlayerForm.appendChild(form);
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
}

const init = async () => {
    state.players = await fetchAllPlayers();
    // console.log(JSON.stringify(players));
    renderAllPlayers(state.players);

    renderNewPlayerForm();
}

init();
