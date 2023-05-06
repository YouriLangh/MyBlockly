// Definition of the 'when_discovered' block
Blockly.Blocks['when_discovered'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When")
        .appendField(new Blockly.FieldLabelSerializable(this.dynamicActor()), "ACTOR")
        //.appendField(new Blockly.FieldTextInput(this.dynamicActor()), "ACTOR")
        .appendField("discovers")
        .appendField(new Blockly.FieldTextInput("pingpong"), "object")
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("ref"), "name")
        this.appendStatementInput("actions")
        .setCheck(null);
        this.setInputsInline(true);
        this.setColour(265);
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

Blockly.Blocks['class_mutator_container'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Crdts:");
    this.appendStatementInput("STACK")
        .setCheck(null);
    this.setColour(60);
 this.setTooltip("");
  }
};
Blockly.Blocks['class_mutator_arg'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("CRDT")
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
 this.setTooltip("");
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
    this.setColour(60);
    this.setTooltip(CLASS_MSG);
    this.data = this.dynamicActor();
    this.crdts_ = 0;
    this.setMutator(new Blockly.Mutator(['class_mutator_arg'], this));
  },
  saveExtraState: function() {
    return {
      'CRDTS': this.crdts_,
    };
  },
  loadExtraState: function(state) {
    this.crdts_ = state['CRDTS'];
    // This is a helper function which adds or removes inputs from the block.
    this.updateShape_();
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('class_mutator_container');
      containerBlock.initSvg();
      let connection = containerBlock.getInput('STACK').connection;
      for (let i = 0; i < this.crdts_; i++) {
        const itemBlock = workspace.newBlock('class_mutator_arg');
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
    for (let i = 0; i < this.crdts_; i++) {
      const connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.crdts_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.crdts_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
    },
    updateShape_: function() {
      if (this.crdts_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      } else if (!this.crdts_ && !this.getInput('EMPTY')) {

      }
      // Add new inputs.
      for (let i = 0; i < this.crdts_; i++) {
        if (!this.getInput('ADD' + i)) {
          const input = this.appendValueInput('ADD' + i)
          .setCheck("CRDT");
          this.removeInput('class_behavior', /* no error */ true);
          if(i == 0){
            input.appendField('With: ')
          } else {
            input.appendField(', ')
          }
          const dummy = this.appendDummyInput("DUMMY" + i)
          dummy.appendField("as")
          dummy.appendField(new Blockly.FieldTextInput("list"), "NAME" + i)
          dummy.appendField("share?")
          dummy.appendField(new Blockly.FieldCheckbox("TRUE"), "SHARE" + i);
            // input.appendField('CRDT ' + i + ':');
            if(i == this.crdts_ - 1){
              this.appendStatementInput('class_behavior');
            }
        }
      }
      // Remove deleted inputs.
      for (let i = this.crdts_; this.getInput('ADD' + i); i++) {
        this.removeInput('ADD' + i);
        this.removeInput('DUMMY' + i)
      }
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
    this.setColour(20);
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
// Definition of the 'console_log' block
Blockly.Blocks['console_log'] = {
  init: function() {
    this.appendValueInput("value")
    .setCheck(null)
    .appendField("console.log");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(110);
    this.setTooltip(CONSOLE_MSG);
    }
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
    this.setColour(90);
    this.setTooltip(TIMEOUT_MSG);
    }
};

Blockly.Blocks['crdt'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["AWSet","AWSet"], ["ORSet","ORSet"]]), "CRDT_type")
    this.setOutput(true, "CRDT");
    this.setColour(75);
 this.setTooltip("");
 this.setHelpUrl("");
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
      this.setColour(50);
      this.setInputsInline(true);
   this.setTooltip("");
   this.setHelpUrl("");
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

  Blockly.Blocks['instance'] = {
    init: function() {
      this.appendValueInput("instance")
          .setCheck(null)
          .appendField("instance of");
      this.setInputsInline(true);
      this.setOutput(true, "INSTANCE");
      this.setColour(50);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  Blockly.Blocks['share'] = {
    init: function() {
      this.appendValueInput("NAME")
          .setCheck(null)
          .appendField("share");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.data = this.dynamicActor();
   this.setTooltip("");
   this.setHelpUrl("");
    },
    dynamicActor: function() {
      var e = document.getElementById('actor_list');
      var actor = e[current].value;
      return actor
    }
  };
  Blockly.JavaScript['share'] = function(block) {
    var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
    var id = block.data;
    // TODO: Assemble JavaScript into code variable.
    var code = `${value_name}.goOnline(Actor_${id},"shared");\n objectMap.set("Actor_${id}", ${value_name});\n`;
    return code;
  };
  Blockly.JavaScript['instance'] = function(block) {
    var value_instance = Blockly.JavaScript.valueToCode(block, 'instance', Blockly.JavaScript.ORDER_ATOMIC);
    // TODO: Assemble JavaScript into code variable.
    var code = `this.${value_instance}`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
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

Blockly.JavaScript['crdt_function'] = function(block) {
  var dropdown_functions = block.getFieldValue('FUNCTIONS');
  var value_instance = Blockly.JavaScript.valueToCode(block, 'instance', Blockly.JavaScript.ORDER_ATOMIC);
  var value_element = Blockly.JavaScript.valueToCode(block, 'element', Blockly.JavaScript.ORDER_ATOMIC);
  console.log(dropdown_functions)
  var code = "";
  if(dropdown_functions == "add" || dropdown_functions == "remove"){
    code =  `${value_instance}.${dropdown_functions}(${value_element});\n`
  } else {
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
  for (let i = 0; i < block.crdts_; i++) {
      var crdt = Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE) || '';
      var name = block.getFieldValue('NAME' + i)
      var share = block.getFieldValue('SHARE' + i) === 'TRUE';
      var elemCode = `this.${name} = ${crdt}\n`
      if(share){
        elemCode += `this.${name}.goOnline(Actor_${id}, "shared");\n`
      }
      elements[i] = elemCode
  }
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

Blockly.JavaScript['crdt_arg'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = `${text_name}`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
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
  if(reply){
    elements.push(`'DEFAULT_${id}'`)
  }
  var code = `${ref_name}.${text_method_name}(` + elements.join(', ') +');\n'
  return code;
};

Blockly.JavaScript['console_log'] = function(block) {
  var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = `print([${value}]);\n`;
  return code;
};

Blockly.JavaScript['param'] = function(block) {
  var param_name = block.getFieldValue('param_name');
  var code = `${param_name}`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['time_out'] = function(block) {
  var text_time = block.getFieldValue('time');
  var statements_name = Blockly.JavaScript.statementToCode(block, 'body');
  var code = `setTimeout(() => {\n${statements_name}}, ${text_time});\n`
  return code;
};