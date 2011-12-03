class this.OpCodes
      
  constructor : (thread) ->    
  
    @[0] = new OpCode('nop', 'Does nothing', (frame) -> yes )
    
    @[1] = new OpCode('aconst_null', 'Push null object reference', (frame) -> 
      frame.op_stack.push(null)
    )
    @[2] = new OpCode('iconst_m1', 'Push int constant -1', (frame) -> 
      frame.op_stack.push(-1)
    )
    @[3] = new OpCode('', '', (frame) -> 
    )
    @[4] = new OpCode('', '', (frame) -> 
    )
    @[5] = new OpCode('', '', (frame) -> 
    )
    @[6] = new OpCode('', '', (frame) -> 
    )
    @[7] = new OpCode('', '', (frame) -> 
    )
    @[8] = new OpCode('iconst_5', 'Pushes int constant 5 to the frame.op_stack.', (frame) -> 
      frame.op_stack.push(5)
    )
    @[9] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[10] = new OpCode('lconst_1', 'Push long constant 1', (frame) -> 
    # not yet implemented
    yes )
    @[11] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[12] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[13] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[14] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[15] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[16] = new OpCode('bipush', 'Push 8 bit signed integer', (frame) -> 
      frame.op_stack.push(frame.method_stack[++thread.pc])
    yes )
    @[17] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[18] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[19] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[20] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[21] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[22] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[23] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[24] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[25] = new OpCode('aload', 'Load reference from local variable', (frame) -> 
      
    yes )
    @[26] = new OpCode('iload0', 'Load int from local variable 0', (frame) -> 
      frame.op_stack.push(frame.locals[0])
    )
    @[27] = new OpCode('iload1', 'Load int from local variable 1', (frame) -> 
      frame.op_stack.push(frame.locals[1])
    )
    @[28] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[29] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[30] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[31] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[32] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[33] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[34] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[35] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[36] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[37] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[38] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[39] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[40] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[41] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[42] = new OpCode('aload_0', 'Load reference from local variable 0', (frame) -> 
    # not yet implemented
    yes )
    @[43] = new OpCode('aload_1', 'Load reference from local variable 1', (frame) -> 
    # not yet implemented
    yes )
    @[44] = new OpCode('aload_2', 'Load reference from local variable 2', (frame) -> 
    # not yet implemented
    yes )
    @[45] = new OpCode('aload_3', 'Load reference from local variable 3', (frame) -> 
    # not yet implemented
    yes )
    @[46] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[47] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[48] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[49] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[50] = new OpCode('aaload', 'Load reference from array', (frame) -> 
    # not yet implemented
    yes )
    @[51] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[52] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[53] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[54] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[55] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[56] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[57] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[58] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[59] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[60] = new OpCode('istore_1', 'Store int from opstack to local variable 1', (frame) -> 
      frame.locals[1] = frame.op_stack.pop()
    yes )
    @[61] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[62] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[63] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[64] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[65] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[66] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[67] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[68] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[69] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[70] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[71] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[72] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[73] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[74] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[75] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[76] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[77] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[78] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[79] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[80] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[81] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[82] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[83] = new OpCode('aastore', 'Store reference into Array', (frame) -> 
    # not yet implemented
    yes )
    @[84] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[85] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[86] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[87] = new OpCode('pop', 'Pops top stack word', (frame) -> 
      frame.op_stack.pop() 
    )
    @[88] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[89] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[90] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[91] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[92] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[93] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[94] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[95] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[96] = new OpCode('iadd', 'Pops two values from the stack, adds them and pushes the result.', (frame) -> 
      i1 = frame.op_stack.pop()
      i2 = frame.op_stack.pop()
      frame.op_stack.push(i1 + i2) 
    )
    @[97] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[98] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[99] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[100] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[101] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[102] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[103] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[104] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[105] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[106] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[107] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[108] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[109] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[110] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[111] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[112] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[113] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[114] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[115] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[116] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[117] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[118] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[119] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[120] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[121] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[122] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[123] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[124] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[125] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[126] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[127] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[128] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[129] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[130] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[131] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[132] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[133] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[134] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[135] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[136] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[137] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[138] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[139] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[140] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[141] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[142] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[143] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[144] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[145] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[146] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[147] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[148] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[149] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[150] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[151] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[152] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[153] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[154] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[155] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[156] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[157] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[158] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[159] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[160] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[161] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[162] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[163] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[164] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[165] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[166] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[167] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[168] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[169] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[170] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[171] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[172] = new OpCode('ireturn', 'Return an int', (frame) -> 
      # get the int to return
      ireturn = frame.op_stack.pop()
      # pop the current method to discard
      thread.jvm_stack.pop()
      # get the invoking method and push the int to its stack
      invoker = thread.jvm_stack.peek()
      invoker.op_stack.push(ireturn)
      # make invoker current and set pc to where invoker was left off
      thread.current_frame = invoker
      thread.pc = invoker.pc    
    )
    @[173] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[174] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[175] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[176] = new OpCode('areturn', 'Return reference', (frame) -> 
    # not yet implemented
    yes )
    @[177] = new OpCode('return', 'Return void from method', (frame) -> 
      # TODO check method returns void 
      thread.jvm_stack.pop()
      thread.current_frame = thread.jvm_stack.peek()
      if thread.current_frame?
        thread.pc = thread.current_frame.pc 
    )
    @[178] = new OpCode('getstatic', 'Fetch static field from class', (frame) -> 
      indexByte1 = frame.method_stack[thread.pc+1]
      indexByte2 = frame.method_stack[thread.pc+2]
      ref = indexByte1 << 8 | indexByte2
      class_field_ref = thread.current_class.constant_pool[ref]
      
      # get the class the owns the static field 
      class_ref = thread.current_class.constant_pool[class_field_ref[0]]
      cls = thread.current_class.constant_pool[class_ref]
      if typeof cls isnt 'object'
        thread.resolveClass(class_ref)
        # break opcode execution until class is resolved
        return false
          
      field_name_type = thread.current_class.constant_pool[class_field_ref[1]]
      field_name = thread.current_class.constant_pool[field_name_type[0]]
      frame.op_stack.push(cls.fields[field_name].value)
      thread.pc += 2
      yes
    # not yet implemented
    yes )
    @[179] = new OpCode('putstatic', 'Set static field in class', (frame) -> 
      indexByte1 = frame.method_stack[thread.pc+1]
      indexByte2 = frame.method_stack[thread.pc+2]
      ref = indexByte1 << 8 | indexByte2
      class_field_ref = thread.current_class.constant_pool[ref]
      
      # get the class the owns the static field 
      cls = thread.current_class.constant_pool[class_field_ref[0]]
      field_ref = thread.current_class.constant_pool[class_field_ref[1]]
      field_name = thread.current_class.constant_pool[field_ref[0]]
      field_type = thread.current_class.constant_pool[field_ref[1]]
      #cls = thread.current_class.constant_pool[class_ref]
      if typeof cls isnt 'object'
        thread.resolveClass(class_ref)
        # break opcode execution until class is resolved
        return false
        
      thread.pc += 2
      value = frame.op_stack.pop()
      # set field value
      cls.fields[field_name].value = value
    yes )
    @[180] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[181] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[182] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[183] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[184] = new OpCode('invokestatic', 'Invoke a class (static) method', (frame) -> 
      # cp ref
      indexByte1 = frame.method_stack[++thread.pc]
      indexByte2 = frame.method_stack[++thread.pc]
      ref = indexByte1 << 8 | indexByte2
      
      method_ref = thread.current_class.constant_pool[ref]
      class_ref = thread.current_class.constant_pool[method_ref[0]]
      method_detail = thread.current_class.constant_pool[method_ref[1]]
      
      if typeof class_ref is 'number'
        thread.resolveClass(class_ref)
        # break opcode execution until class is resolved
        return false
        
      method = class_ref.methods[thread.current_class.constant_pool[method_detail[0]]]
      
      thread.current_class = class_ref
      # set frame pc to skip operands, and machine pc to nil for new method
      frame.pc += 2
      thread.pc = -1
      
      # create new frame for the static method
      newframe = new Frame(method, thread.current_class)
      # pop the args off the current op_stack into the local vars of the new frame
      arg_num = 0
      while frame.op_stack.length > 0
        newframe.locals[arg_num++] = frame.op_stack.pop()
            
      # set the current frame to our new method frame
      thread.current_frame = newframe
      thread.jvm_stack.push(thread.current_frame)
      yes 
    )
    @[185] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[186] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[187] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[188] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[189] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[190] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[191] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[192] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[193] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[194] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[195] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[196] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[197] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[198] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[199] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[200] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[201] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[202] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[203] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[204] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[205] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[206] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[207] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[208] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[209] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[210] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[211] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[212] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[213] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[214] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[215] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[216] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[217] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[218] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[219] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[220] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[221] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[222] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[223] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[224] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[225] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[226] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[227] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[228] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[229] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[230] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[231] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[232] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[233] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[234] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[235] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[236] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[237] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[238] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[239] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[240] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[241] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[242] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[243] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[244] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[245] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[246] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[247] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[248] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[249] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[250] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[251] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[252] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[253] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[254] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
    @[255] = new OpCode('', '', (frame) -> 
    # not yet implemented
    yes )
        
    

    
  
class OpCode
  constructor : (@mnemonic, @description, @do) ->
    this
  
  
