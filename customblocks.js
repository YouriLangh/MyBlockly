// Definition of the 'when_discovered' block
Blockly.Blocks['when_discovered'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When")
        .appendField(new Blockly.FieldLabelSerializable(this.dynamicActor()), "ACTOR")
        .appendField("discovers")
        .appendField(new Blockly.FieldTextInput("pingpong"), "object")
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("ref"), "name")
        this.appendStatementInput("actions")
        .setCheck(null);
        this.setInputsInline(true);
        this.setColour(245);
        this.setTooltip(WHEN_DISCOVERED_MSG);
        this
  },
  dynamicActor: function() {
      var e = document.getElementById('actor_list');
      var actor = e[current].text;
      return actor
  },
};
// Definition of the 'param' block used to represent the parameters of the 'on_receive' block
Blockly.Blocks['param'] = {
  init: function() {
    this.appendDummyInput()
    .appendField(new Blockly.FieldTextInput("default"), "param_name");
    this.setOutput(true, null);
    this.setColour(20);
    this.setTooltip(PARAM_MSG);
    }
};
// Definition of the 'send_msg_arg' block, used in the decompose function of 'send_msg' to allow the addition of extra inputs/arguments.
Blockly.Blocks['send_msg_arg'] = {
  init: function() {
    this.appendDummyInput("NAME")
    .appendField("input");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(220);
    this.setTooltip(SEND_ARG_MSG);}
};
// Definition of the 'send_msg' block
Blockly.Blocks['send_msg'] = {
  init: function() {
    this.argCount_ = 0;
    this.appendDummyInput()
    .appendField("Send message")
    .appendField(new Blockly.FieldTextInput("ping"), "method_name")
    .appendField("to")
    .appendField(new Blockly.FieldTextInput("ref"), "ref_name")
    .appendField("expects reply?")
    .appendField(new Blockly.FieldCheckbox("TRUE"), "reply");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(220);
    this.setTooltip(SEND_MSG);
    this.data = this.dynamicActor();
    //this.setInputsInline(true)
    this.setMutator(new Blockly.Mutator(['send_msg_arg'], this));
    },
    saveExtraState: function() {
      return {
        'args': this.argCount_,
      };
    },
    loadExtraState: function(state) {
      this.argCount_ = state['args'];
      this.updateShape_();
    },
    //Create the block in the dialog window
    decompose: function(workspace) {
      const containerBlock = workspace.newBlock('send_msg_create');
      containerBlock.initSvg();
      let connection = containerBlock.getInput('STACK').connection;
      for (let i = 0; i < this.argCount_; i++) {
        const itemBlock = workspace.newBlock('send_msg_arg');
        itemBlock.initSvg();
        connection.connect(itemBlock.previousConnection);
        connection = itemBlock.nextConnection;
      }
      return containerBlock;
    },
    compose: function(containerBlock) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK');
      // Count number of inputs.
      const connections = [];
      while (itemBlock) {
        if (itemBlock.isInsertionMarker()) {
          itemBlock = itemBlock.getNextBlock();
          continue;
        }
        connections.push(itemBlock.valueConnection_);
        itemBlock = itemBlock.getNextBlock();
      }
      // Disconnect any children that don't belong.
      for (let i = 0; i < this.argCount_; i++) {
        const connection = this.getInput('ADD' + i).connection.targetConnection;
        if (connection && connections.indexOf(connection) === -1) {
          connection.disconnect();
        }
      }
      this.argCount_ = connections.length;
      this.updateShape_();
      // Reconnect any child blocks.
      for (let i = 0; i < this.argCount_; i++) {
        Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
      }
    },
    updateShape_: function() {
      if (this.argCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      } else if (!this.argCount_ && !this.getInput('EMPTY')) {

      }
      // Add new inputs.
      for (let i = 0; i < this.argCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          const input = this.appendValueInput('ADD' + i).setAlign(Blockly.ALIGN_RIGHT);
            input.appendField('ARG ' + i + ':');
        }
      }
      // Remove deleted inputs.
      for (let i = this.argCount_; this.getInput('ADD' + i); i++) {
        this.removeInput('ADD' + i);
      }
    },
    dynamicActor: function() {
      var e = document.getElementById('actor_list');
      var actor = e[current].text;
      return actor
  },
  };
// Definition for the 'send_msg_create' block used by the decompose function of 'send_msg'
Blockly.Blocks['send_msg_create'] = {
  init: function() {
  this.appendDummyInput()
  .appendField("Arguments");
  this.appendStatementInput("STACK")
  .setCheck(null);
  this.setColour(220);
  this.setTooltip(SEND_CREATE_MSG);
  }
};


// Definition of the 'class_block' block
Blockly.Blocks['class_block'] = {
  init: function() {
    this.appendDummyInput()
    .appendField("Object")
    .appendField(new Blockly.FieldTextInput("pingpong"), "class_name")
    .appendField("export object?")
    .appendField(new Blockly.FieldCheckbox("TRUE"), "export")
    this.appendStatementInput("class_behavior")
    .setCheck(null);
    this.setColour(40);
    this.setTooltip(CLASS_MSG);
    this.data = this.dynamicActor();
    this.crdts_ = 0;
  },
  dynamicActor: function() {
    var e = document.getElementById('actor_list');
    var actor = e[current].value;
    return actor
},

};
// Definition of the 'receive_mutator_arg' block used by the decompose function of the 'on_receive' block
Blockly.Blocks['receive_mutator_arg'] = {
  init: function() {
    this.appendDummyInput()
    .appendField("input name:")
    .appendField(new Blockly.FieldTextInput("x"), "NAME")
    this.setPreviousStatement(true);
    this.setColour(20);
    this.setNextStatement(true);
    this.setTooltip(RECEIVE_ARG_MSG);
    this.contextMenu = false;
    },
};

// Definition of the on_receive block
Blockly.Blocks['on_receive'] = {
  init: function() {
    this.appendDummyInput("receive_dummy")
    .appendField("On receive:")
    .appendField(new Blockly.FieldTextInput("ping"), "function_name")
    .appendField('', 'PARAMS')
    this.appendStatementInput("behavior")
    .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(35);
    this.setTooltip(RECEIVE_MSG);
    this.arguments_ = [];
    this.data = this.dynamicActor()
    this.setInputsInline(true);
    this.setMutator(new Blockly.Mutator(['receive_mutator_arg'], this));
    },
    saveExtraState: function() {
      return {
        'arguments_': this.arguments_,
      };
    },
    loadExtraState: function(state) {
      this.arguments_ = state['arguments_'];
      // This is a helper function which adds or removes inputs from the block.
      this.updateParams_();
    },
    decompose: function(workspace) {
      const containerBlockNode = document.createElement('block');
      containerBlockNode.setAttribute('type', 'receive_mutator_container');
      const statementNode = document.createElement('statement');
      statementNode.setAttribute('name', 'STACK');
      containerBlockNode.appendChild(statementNode);
  
      let node = statementNode;
      for (let i = 0; i < this.arguments_.length; i++) {
        const argBlockNode = document.createElement('block');
        argBlockNode.setAttribute('type', 'receive_mutator_arg');
        const fieldNode = document.createElement('field');
        fieldNode.setAttribute('name', 'NAME');
        const argumentName = document.createTextNode(this.arguments_[i]);
        fieldNode.appendChild(argumentName);
        argBlockNode.appendChild(fieldNode);
        const nextNode = document.createElement('next');
        argBlockNode.appendChild(nextNode);
  
        node.appendChild(argBlockNode);
        node = nextNode;
      }
      const containerBlock = Blockly.Xml.domToBlock(containerBlockNode, workspace);
      return containerBlock;
    },
    compose: function(containerBlock) {
        // Parameter list.
        this.arguments_ = [];
        let paramBlock = containerBlock.getInputTargetBlock('STACK');
        while (paramBlock && !paramBlock.isInsertionMarker()) {
          const varName = paramBlock.getFieldValue('NAME');
          this.arguments_.push(varName);
          paramBlock =
              paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
        }
        this.updateParams_();
      },
    updateShape_: function() {
      for (let i = 0; i < this.arguments_.length; i++) {
        const argField = this.getField('ARGNAME' + i);
        if (argField) {
          // Ensure argument name is up to date.
          // The argument name field is deterministic based on the mutation,
          argField.setValue(this.arguments_[i]);
          }
        }
        // Remove deleted inputs.
        for (let i = this.arguments_.length; this.getInput('ARGNAME' + i); i++) {
          this.removeInput('ARGNAME' + i);
        }
    },
    updateParams_: function() {
      // Merge the arguments into a human-readable list.
      let paramString = '';
      if (this.arguments_.length) {
        paramString =' with: ' + this.arguments_.join(', ');
      }
      this.setFieldValue(paramString, 'PARAMS');
    },
    dynamicActor: function() {
      var e = document.getElementById('actor_list');
      var actor = e[current].value;
      return actor
  },
  };

// Definition of the 'time_out' block
Blockly.Blocks['time_out'] = {
  init: function() {
    this.appendDummyInput()
    .appendField("setTimeout")
    .appendField(new Blockly.FieldTextInput("1000"), "time")
    .appendField("ms");
    this.appendStatementInput("body")
    .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(100);
    this.setTooltip(TIMEOUT_MSG);
    }
};
// Definition of the 'console_log' block
Blockly.Blocks['console_log'] = {
  init: function() {
    this.appendValueInput("value")
    .setCheck(null)
    .appendField("console.log");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(100);
    this.setTooltip(CONSOLE_MSG);
    }
};
// Definition of the 'crdt' block
Blockly.Blocks['crdt'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["AWSet","AWSet"], ["ORSet","ORSet"]]), "CRDT_type")
    this.setOutput(true, "CRDT");
    this.setColour(10);
 this.setTooltip(CRDT_MSG);
 this.data = this.dynamicActor();
  },
  dynamicActor: function() {
    var e = document.getElementById('actor_list');
    var actor = e[current].value;
    return actor
  }
};
Blockly.Blocks['crdt_arg'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("list"), "NAME");
    this.setOutput(true, null);
    this.setColour(80);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

// Definition of the 'receive_mutator_container' used in the decompose function of the 'on_receive' block
Blockly.Blocks['receive_mutator_container'] = {
    /**
     * Mutator block for receive container.
     * @this {Block}
     */
  init: function() {
    this.appendDummyInput().appendField("inputs");
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
    this.setColour(20);
    this.contextMenu = false;
    },
};
// Definition of the 'crdt_function' block
Blockly.Blocks['crdt_function'] = {
  init: function() {
    var options = [
      ["add","add"],
      ["remove","remove"],
      ["serialize","serialize"],
    ];
    this.appendDummyInput()
    .appendField(new Blockly.FieldDropdown(options, this.validate), 'FUNCTIONS')
    this.appendValueInput("element")
    .setCheck(null)
    this.appendValueInput("instance")
    .setCheck("INSTANCE")
    .appendField('to', 'TEXT')
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(10);
    this.setInputsInline(true);
    this.setTooltip(CRDT_FUNCTION_MSG);
    },
    validate: function(newValue) {
      this.getSourceBlock().updateConnections(newValue);
      return newValue;
    },
    updateConnections: function(newValue) {
      this.removeInput('instance', /* no error */ true);
      this.removeInput('element', /* no error */ true);
      if (newValue == 'remove') {
        this.appendValueInput("element")
       .setCheck(null)
      this.appendValueInput("instance")
      .setCheck("INSTANCE")
      .appendField('from', 'TEXT')
      } else if (newValue == 'serialize') {
        this.appendValueInput('instance')
        .setCheck("INSTANCE")
      } else if (newValue == 'add'){
        this.appendValueInput("element")
       .setCheck(null)
      this.appendValueInput("instance")
      .setCheck("INSTANCE")
      .appendField('to', 'TEXT')

      }
    }
};
// Definition of the 'share'  block
Blockly.Blocks['share'] = {
  init: function() {
    this.appendValueInput("crdt")
    .setCheck("CRDT")
    .appendField("share");
    this.appendDummyInput()
    .appendField("with tag")
    .appendField("\"")
    .appendField(new Blockly.FieldTextInput("shared"), "tag")
    .appendField("\"");
    this.setColour(10);
   this.setTooltip(SHARE_MSG);
   this.data = this.dynamicActor();
  },
  dynamicActor: function() {
    var e = document.getElementById('actor_list');
    var actor = e[current].value;
    return actor
  }
};

// Generate the corresponding JavaScript for each block
/**
 * Define the behavior of the 'on_receive' block. 
 * @param {Block} block 
 * @returns A string representing the block in code
 */
Blockly.JavaScript['on_receive'] = function(block) {
  var function_name = block.getFieldValue('function_name');
  var id = block.data;
  var behavior = Blockly.JavaScript.statementToCode(block, 'behavior');
  // For every argument of the on_receive block, add an argument for the function
  if(block.arguments_.length > 0){
    var code = `${function_name}(` + block.arguments_.join(', ') + `, obj = "none"){\n` + "if (obj == 'none'){\n" + behavior + "\n} else {" + `Actor_${id}.whenDiscovered(obj, function (ref) {\n` + behavior + `\n})}};\n`;
  } else {
    var code = `${function_name}(obj = "none"){\n` + "if (obj == 'none'){\n" + behavior + "\n} else {\n" + `Actor_${id}.whenDiscovered(obj, function (ref) {\n` + behavior + `\n})}};\n`;
  }
  return code;
};

Blockly.JavaScript['crdt'] = function(block) {
  var dropdown_crdt_type = block.getFieldValue('CRDT_type');
  var code = `new ${dropdown_crdt_type}()`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['share'] = function(block) {
  var value_crdt = Blockly.JavaScript.valueToCode(block, 'crdt', Blockly.JavaScript.ORDER_ATOMIC);
  var text_tag = block.getFieldValue('tag');
  var id = block.data;
  // Add the crdt to the object map to allow the addition of items to the CRDT
  var code = `${value_crdt}.goOnline(Actor_${id}, "${text_tag}");\n objectMap.set("Actor_${id}", ${value_crdt});\n`;
  return code;
};

Blockly.JavaScript['crdt_function'] = function(block) {
  var dropdown_functions = block.getFieldValue('FUNCTIONS');
  var value_instance = Blockly.JavaScript.valueToCode(block, 'instance', Blockly.JavaScript.ORDER_ATOMIC);
  var value_element = Blockly.JavaScript.valueToCode(block, 'element', Blockly.JavaScript.ORDER_ATOMIC);
  var code = "";
  if(dropdown_functions == "add" || dropdown_functions == "remove"){
    code =  `${value_instance}.${dropdown_functions}(${value_element});\n`
  } else {
    // for serialization, instantly display the result
    code = `console.log(${value_instance}.serialize());\n`
  }
  return code;
};

Blockly.JavaScript['class_block'] = function(block) {
  var class_name = block.getFieldValue('class_name');
  var id = block.data;
  var toExport = block.getFieldValue('export') === 'TRUE';
  var statements_class_behavior = Blockly.JavaScript.statementToCode(block, 'class_behavior');
  const elements = [];
  var code = ''
  if(toExport){
    code = `class ${class_name} {\n constructor(){\n` + elements.join('\n')+ `}\n  ${statements_class_behavior} };\n objectMap.set("${class_name}", new ${class_name}());\n` 
    + `Actor_${id}.doExport('${class_name}', `+ `getObject('${class_name}')` + `); \n`
    ;
  } else {
    code = `class ${class_name} {\n constructor(){\n` +  elements.join('\n')+ `}\n  ${statements_class_behavior} };\n objectMap.set("${class_name}", new ${class_name}());\n`;
  }
  
  return code;
};

Blockly.JavaScript['when_discovered'] = function(block) {
  var actor = block.getFieldValue("ACTOR");
  var object_name = block.getFieldValue('object') || '';
  var arg_name = block.getFieldValue('name') || '';
  if(actor != '' && object_name != null){
  var statements = Blockly.JavaScript.statementToCode(block, 'actions');
  var code = `${actor}.whenDiscovered('${object_name}', function (${arg_name}) {\n` + statements + '})\n'
  }else {
    code = '';}
  return code;
};

Blockly.JavaScript['send_msg'] = function(block) {
  var text_method_name = block.getFieldValue('method_name');
  var ref_name = block.getFieldValue('ref_name');
  var reply = block.getFieldValue('reply') === 'TRUE';
  let id = block.data;
  const elements = [];
  for (let i = 0; i < block.argCount_; i++) {
    elements[i] =
      Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE) || '';
  }
  // If a reply is expected, send the id of the current actor too : DEFAULT_ACTOR_ID
  if(reply){
    elements.push(`'DEFAULT_${id}'`)
  }
  var code = `${ref_name}.${text_method_name}(` + elements.join(', ') +');\n'
  return code;
};


Blockly.JavaScript['param'] = function(block) {
  var param_name = block.getFieldValue('param_name');
  var code = `${param_name}`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['console_log'] = function(block) {
  var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `console.log(${value});\n`;
  return code;
};
Blockly.JavaScript['time_out'] = function(block) {
  var text_time = block.getFieldValue('time');
  var statements_name = Blockly.JavaScript.statementToCode(block, 'body');
  var code = `setTimeout(() => {\n${statements_name}}, ${text_time});\n`
  return code;
};