// counter for amount of actors
let next = 0;
// id of the current actor
let current = -1;
// Array which holds JSON representation of all the blocks for every actor
// jsonList[i] = All the blocks for actor i in JSON
var jsonList = [];
// array holding all the types of blocks that have to be created in the Flec category on initialization
let blockTypeArray = ['when_discovered', 'class_block', 'on_receive', 'console_log', 'time_out', 'crdt', 'crdt_function', 'instance']
// a Map which holds all the objects created in the workspace as ["class", new class()]
const objectMap = new Map()
// Button for adding new tabs/actors
let addButton = document.getElementById("add");
addButton.addEventListener("click", addTab);
let A1Button = document.getElementById("A1Enter");
A1Button.addEventListener("click", A1);
let A2Button = document.getElementById("A2Enter");
A2Button.addEventListener("click", A2);
let showButton = document.getElementById("show");
showButton.addEventListener("click", showCRDT);
//TODO: Send Msg + expects reply back when calling the add procedure of another actor (add .. to list) will not work due to promise conflict. 
function A1(){
  let obj = objectMap.get("pingpong");
  var input = document.getElementById("A1")
  obj.list.add(`'${input.value}'`)
  input.value = '';
}

function A2(){
  let obj = objectMap.get("pingpong2");
  var input = document.getElementById("A2")
  obj.list.add(`'${input.value}'`)

  // eval(input.value)
  input.value = '';
}

function showCRDT(){
  let obj = objectMap.get("pingpong")
  console.log(obj.list.serialize())
  // print([obj.list.serialize()]);
}

/**
 * Function to print to console on HTML page
 * Takes an array with strings, and adds them to the console with a breakline in between.
 * @param arr 
 */
function print(arr){
  var console = document.getElementById("console_p")
  for(let idx in arr){
    var str = arr[idx];
    var br = document.createElement('br')
    console.append(str)
    console.append(br)}
}
/**
 * Construct the blocks required by the flyout
 * @param arr An array containing the types of all the blocks that have to be created
 * @returns Array of XML block elements
 */
function createBlocks(arr){
  let list = []
  for(let idx in arr){
    let type = arr[idx];
    const block = document.createElement('block');
    block.setAttribute('type', type)
    list.push(block);}
  return list;
}
/**
 * Function to clear the console on HTML page
 */
function clearConsole(){
  var p = document.getElementById("console_p")
  while (p.hasChildNodes()) {
    p.removeChild(p.firstChild);
  }
}
/**
 * Generates the code for all the actors/tabs
 * @returns A string representing the converted code
 */
function generateCode(){
  var code = [];
  // Generate the code for each actor and place the resulting string in code[actor]
  for (let actor in jsonList){
    // Load the workspace of the actor in the hidden workspace if there is something in the workspace else generate '';
    if(jsonList[actor] && typeof jsonList[actor] !== 'undefined') {
    Blockly.serialization.workspaces.load(jsonList[actor], hiddenWorkspace);
    // Use Blockly workspaceToCode to convert workspace to code
    var codePart = Blockly.JavaScript.workspaceToCode(hiddenWorkspace)
    code[actor] = codePart;
    } else {
      code[actor] = '';
    }
  }
  // Combine all the code with a newline between the code for each actor
  code = code.join('\n');
  var configCode = ConfigToCode()
  return configCode + code
 }

/**
 * 
 * @param tag 
 * @returns Object corresponding with key = tag from objectMap
 */
function getObject(tag){
return objectMap.get(tag)
}

/**
 * Adds an actor and adds it to the dropdown menu
 * Changes current to newly added actor, increments amount of actors.
 */
function addActor(){
    let dropdown = document.getElementById('actor_list');
    var option = document.createElement('option');
    option.text = "Actor_" + next;
    option.value = next;
    dropdown.add(option);
    dropdown.value = next;
    current = next;
    next++;
}

/**
 * Generates the code that creates all actors and should precede the Blockly code
 * @returns String representing the code for the creation of the central switchboard and for the creation and registration of each actor
 */
function ConfigToCode(){
  // For every actor, generate the code to create a new actor and register it to the switchboard
    var dropdown = document.getElementById('actor_list');
    var str = 'const ctx = new TSAT("vma"); \n'
    let opts = dropdown.options
    for (let i = 0; i < opts.length; i++) {
        str += `const ${opts[i].text} = new Actor(\"${opts[i].text}\"); \n` +
        `ctx.registerActor(${opts[i].text});\n`;}
    return str;
  }

  /**
   * Save the workspace of the current tab to jsonList in JSON
   */
function saveWorkspace(){
  // If there is 1 or more actors, save the tab of the current actor
  if(current != -1){
  var json = Blockly.serialization.workspaces.save(demoWorkspace);
  // If the workspace of the current actor contains blocks, save the workspace by converting to JSON and saving in jsonList[current]
  if(Object.keys(json).length > 0){
  jsonList[current] = json;
  } else {
    // else save undefined to show no blocks are in the workspace
    jsonList[current] = undefined
  }}}

/**
 * Turn the JSON of the corresponding current actor to blocks and load it into the workspace
 */
function loadWorkspace(){
  // If there are blocks to load in
  if(jsonList[current] && typeof jsonList[current] !== 'undefined') {
  Blockly.serialization.workspaces.load(jsonList[current], demoWorkspace);
  }
}

/**
 * Adds a tab & actor 
 */
function addTab(){
  saveWorkspace();
  addActor();
  // Clear workspace and refresh the toolbox
  demoWorkspace.clear();
  demoWorkspace.refreshToolboxSelection();
}
/**
 * Changes the tab to the one of the selected actor in the dropdown menu
 * @param dropdown
 */
function changeTab(dropdown){
  saveWorkspace();
  current = dropdown.value
  demoWorkspace.clear();
  loadWorkspace();

}
// Create an actor/tab on initialization
addTab();
