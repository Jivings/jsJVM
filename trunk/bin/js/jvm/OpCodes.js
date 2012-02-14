(function() {
  var OpCode;
  this.OpCodes = (function() {
    function OpCodes(thread) {
      this[0] = new OpCode('nop', 'Does nothing', function(frame) {
        return true;
      });
      this[1] = new OpCode('aconst_null', 'Push null object reference', function(frame) {
        return frame.op_stack.push(new JVM_Reference(0));
      });
      this[2] = new OpCode('iconst_m1', 'Push int constant -1', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(-1));
      });
      this[3] = new OpCode('iconst_0', 'Push int constant 0', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(0));
      });
      this[4] = new OpCode('iconst_1', 'Push int constant 1', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(1));
      });
      this[5] = new OpCode('iconst_2', 'Push int constant 2', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(2));
      });
      this[6] = new OpCode('iconst_3', 'Push int constant 3', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(3));
      });
      this[7] = new OpCode('iconst_4', 'Push int constant 4', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(4));
      });
      this[8] = new OpCode('iconst_5', 'Pushes int constant 5 to the frame.op_stack.', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(5));
      });
      this[9] = new OpCode('lconst_0', 'Push long constant 0', function(frame) {
        frame.op_stack.push(new CONSTANT_long(0));
        return frame.op_stack.push(new CONSTANT_long(0));
      });
      this[10] = new OpCode('lconst_1', 'Push long constant 1', function(frame) {
        frame.op_stack.push(new CONSTANT_long(1));
        return frame.op_stack.push(new CONSTANT_long(1));
      });
      this[11] = new OpCode('fconst_0', 'Push float 0', function(frame) {
        return frame.op_stack.push(new CONSTANT_float());
      });
      this[12] = new OpCode('fconst_1', 'Push float 1', function(frame) {
        return frame.op_stack.push(new CONSTANT_float(1.0));
      });
      this[13] = new OpCode('fconst_2', 'Push float 2', function(frame) {
        return frame.op_stack.push(new CONSTANT_float(2.0));
      });
      this[14] = new OpCode('dconst_0', 'Push double 0', function(frame) {
        frame.op_stack.push(new CONSTANT_double(0.0));
        return frame.op_stack.push(new CONSTANT_double(0.0));
      });
      this[15] = new OpCode('dconst_1', 'Push double 1', function(frame) {
        frame.op_stack.push(new CONSTANT_double(1.0));
        return frame.op_stack.push(new CONSTANT_double(1.0));
      });
      this[16] = new OpCode('bipush', 'Push 8 bit signed integer', function(frame) {
        return frame.op_stack.push(new CONSTANT_integer(this.getIndexByte(1, frame, thread), false));
      });
      this[17] = new OpCode('sipush', 'Push short', function(frame) {
        var byte1, byte2, short;
        byte1 = this.getIndexByte(1, frame, thread);
        byte2 = this.getIndexByte(1, frame, thread);
        short = (byte1 << 8) | byte2;
        return frame.op_stack.push(new CONSTANT_short(short));
      });
      this[18] = new OpCode('ldc', 'Push item from constant pool', function(frame) {
        var item;
        item = this.getIndexByte(1, frame, thread);
        while (typeof (item = this.fromClass(item, thread)) === 'number') {
          continue;
        }
        if (item instanceof CONSTANT_Stringref) {
          thread.resolveString(this.fromClass(item.string_index, thread), function(string) {
            return frame.op_stack.push(string);
          }, this);
          return false;
        }
        if (item === void 0) {
          throw 'JVM_Error: Undefined item on stack';
        }
        if (item instanceof JVM_Object) {
          item = new JVM_Reference(thread.allocate(item));
        }
        return frame.op_stack.push(item);
      });
      this[19] = new OpCode('ldc_w', 'Push item from constant pool (wide index)', function(frame) {
        var item;
        item = this.constructIndex(frame, thread);
        while (typeof (item = this.fromClass(item, thread)) === 'number') {
          continue;
        }
        if (item instanceof JVM_Object) {
          item = new JVM_Reference(thread.allocate(item), function() {
            return frame.op_stack.push(item);
          });
          return false;
        }
        return frame.op_stack.push(item);
      });
      this[20] = new OpCode('ldc2_w', 'Push long or double from constant pool (wide index)', function(frame) {
        var index, item;
        index = this.constructIndex(frame, thread);
        item = this.fromClass(index, thread);
        frame.op_stack.push(item);
        return frame.op_stack.push(item);
      });
      this[21] = new OpCode('iload', 'Load int from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[22] = new OpCode('lload', 'Load long from local variable', function(frame) {
        frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[23] = new OpCode('fload', 'Load float from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[24] = new OpCode('dload', 'Load double from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[25] = new OpCode('aload', 'Load reference from local variable', function(frame) {
        return frame.op_stack.push(frame.locals[this.getIndexByte(1, frame, thread)]);
      });
      this[26] = new OpCode('iload_0', 'Load int from local variable 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[27] = new OpCode('iload_1', 'Load int from local variable 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[28] = new OpCode('iload_2', 'Load int from local variable 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[29] = new OpCode('iload_3', 'Load int from local variable 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[30] = new OpCode('lload_0', 'Load long from local variable 0', function(frame) {
        frame.op_stack.push(frame.locals[0]);
        return frame.op_stack.push(frame.locals[0]);
      });
      this[31] = new OpCode('lload_1', 'Load long from local variable 1', function(frame) {
        frame.op_stack.push(frame.locals[1]);
        return frame.op_stack.push(frame.locals[1]);
      });
      this[32] = new OpCode('lload_2', 'Load long from local variable 2', function(frame) {
        frame.op_stack.push(frame.locals[2]);
        return frame.op_stack.push(frame.locals[2]);
      });
      this[33] = new OpCode('lload_3', 'Load long from local variable 3', function(frame) {
        frame.op_stack.push(frame.locals[3]);
        return frame.op_stack.push(frame.locals[3]);
      });
      this[34] = new OpCode('fload_0', 'Load float from local var 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[35] = new OpCode('fload_1', 'Load float from local var 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[36] = new OpCode('fload_2', 'Load float from local var 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[37] = new OpCode('fload_3', 'Load float from local var 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[38] = new OpCode('dload_0', 'Load double from local variable', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[39] = new OpCode('dload_1', 'Load double from local variable 1', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[40] = new OpCode('dload_2', 'Load double from local variable 2', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[41] = new OpCode('dload_3', 'Load double from local variable 3', function(frame) {
        var halfDouble, secHalfDouble;
        halfDouble = frame.locals[0];
        secHalfDouble = frame.locals[1];
        frame.op_stack.push(halfDouble);
        return frame.op_stack.push(halfDouble);
      });
      this[42] = new OpCode('aload_0', 'Load reference from local variable 0', function(frame) {
        return frame.op_stack.push(frame.locals[0]);
      });
      this[43] = new OpCode('aload_1', 'Load reference from local variable 1', function(frame) {
        return frame.op_stack.push(frame.locals[1]);
      });
      this[44] = new OpCode('aload_2', 'Load reference from local variable 2', function(frame) {
        return frame.op_stack.push(frame.locals[2]);
      });
      this[45] = new OpCode('aload_3', 'Load reference from local variable 3', function(frame) {
        return frame.op_stack.push(frame.locals[3]);
      });
      this[46] = new OpCode('iaload', 'Load int from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var int;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          int = array[arrayindex];
          return frame.op_stack.push(int);
        }, this);
        return false;
      });
      this[47] = new OpCode('laload', 'Load long from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var long;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          long = array[arrayindex];
          return frame.op_stack.push(long);
        }, this);
        return false;
      });
      this[48] = new OpCode('faload', 'Load float from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var float;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          float = array[arrayindex];
          return frame.op_stack.push(float);
        }, this);
        return false;
      });
      this[49] = new OpCode('daload', 'Load double from array', function(frame) {
        var arrayindex, arrayref;
        arrayref = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var double;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          double = array[arrayindex];
          return frame.op_stack.push(double);
        }, this);
        return false;
      });
      this[50] = new OpCode('aaload', 'Load reference from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        thread.getObject(arrayref, function(array) {
          var ref;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ref = array[arrayindex];
          return frame.op_stack.push(ref);
        }, this);
        return false;
      });
      this[51] = new OpCode('baload', 'Load byte or boolean from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var ba;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ba = array[arrayindex];
          return frame.op_stack.push(ba);
        }, this);
        return false;
      });
      this[52] = new OpCode('caload', 'Load char from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var ch;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          ch = array[arrayindex];
          return frame.op_stack.push(ch);
        }, this);
        return false;
      });
      this[53] = new OpCode('saload', 'Load short from array', function(frame) {
        var arrayindex, arrayref;
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          var sh;
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          sh = array[arrayindex];
          return frame.op_stack.push(sh);
        }, this);
        return false;
      });
      this[54] = new OpCode('istore', 'Store int into local variable', function(frame) {
        var index, int;
        index = this.getIndexByte(1, frame, thread);
        int = frame.op_stack.pop();
        return frame.locals[index] = int;
      });
      this[55] = new OpCode('lstore', 'Store long into local variable', function(frame) {
        var index, long;
        index = this.getIndexByte(1, frame, thread);
        long = frame.op_stack.pop();
        return frame.locals[index] = long;
      });
      this[56] = new OpCode('fstore', 'Store float into local variable', function(frame) {
        var float, index;
        index = this.getIndexByte(1, frame, thread);
        float = frame.op_stack.pop();
        return frame.locals[index] = float;
      });
      this[57] = new OpCode('dstore', 'Store double into local variable', function(frame) {
        var d, d1, index;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        index = this.getIndexByte(1, frame, thread);
        return frame.locals[index] = d;
      });
      this[58] = new OpCode('astore', 'Store reference into local variable', function(frame) {
        var index, objectref;
        index = this.getIndexByte(1, frame, thread);
        objectref = frame.op_stack.pop();
        return frame.locals[index] = objectref;
      });
      this[59] = new OpCode('istore_0', 'Store int from opstack to local variable 0', function(frame) {
        return frame.locals[0] = frame.op_stack.pop();
      });
      this[60] = new OpCode('istore_1', 'Store int from opstack to local variable 1', function(frame) {
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[61] = new OpCode('istore_2', 'Store int from opstack to local variable 2', function(frame) {
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[62] = new OpCode('istore_3', 'Store int from opstack to local variable 3', function(frame) {
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[63] = new OpCode('lstore_0', 'Store long into local variable 0', function(frame) {
        frame.locals[0] = frame.op_stack.pop();
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[64] = new OpCode('lstore_1', 'Store long into local variable 1', function(frame) {
        frame.locals[1] = frame.op_stack.pop();
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[65] = new OpCode('lstore_2', 'Store long into local variable 2', function(frame) {
        frame.locals[2] = frame.op_stack.pop();
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[66] = new OpCode('lstore_3', 'Store long into local variable 3', function(frame) {
        frame.locals[3] = frame.op_stack.pop();
        return frame.locals[4] = frame.op_stack.pop();
      });
      this[67] = new OpCode('fstore_0', 'Store float into local variable 0', function(frame) {
        return frame.locals[0] = frame.op_stack.pop();
      });
      this[68] = new OpCode('fstore_1', 'Store float into local variable 1', function(frame) {
        return frame.locals[1] = frame.op_stack.pop();
      });
      this[69] = new OpCode('fstore_2', 'Store float into local variable 2', function(frame) {
        return frame.locals[2] = frame.op_stack.pop();
      });
      this[70] = new OpCode('fstore_3', 'Store float into local variable 3', function(frame) {
        return frame.locals[3] = frame.op_stack.pop();
      });
      this[71] = new OpCode('dstore_0', 'Store double to local var 0', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[0] = d;
        frame.locals[1] = d1;
        return true;
      });
      this[72] = new OpCode('dstore_1', 'Store double to local var 1', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[1] = d;
        frame.locals[2] = d1;
        return true;
      });
      this[73] = new OpCode('dstore_2', 'Store double to local var 2', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[2] = d;
        frame.locals[3] = d1;
        return true;
      });
      this[74] = new OpCode('dstore_3', 'Store double to local var 3', function(frame) {
        var d, d1;
        d = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        frame.locals[3] = d;
        frame.locals[4] = d1;
        return true;
      });
      this[75] = new OpCode('astore_0', 'Store reference into local var 0', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[0] = objectref;
        return true;
      });
      this[76] = new OpCode('astore_1', 'Store reference into local var 1', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[1] = objectref;
        return true;
      });
      this[77] = new OpCode('astore_2', 'Store reference into local var 2', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[2] = objectref;
        return true;
      });
      this[78] = new OpCode('astore_3', 'Store reference into local var 3', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        frame.locals[3] = objectref;
        return true;
      });
      this[79] = new OpCode('iastore', 'Store into int array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[80] = new OpCode('lastore', 'Store into long array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[81] = new OpCode('fastore', 'Store into float array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[82] = new OpCode('dastore', 'Store double into array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[83] = new OpCode('aastore', 'Store reference into Array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[84] = new OpCode('bastore', 'Store into byte or boolean Array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[85] = new OpCode('castore', 'Store into char array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[86] = new OpCode('sastore', 'Store into short array', function(frame) {
        var arrayindex, arrayref, value;
        value = frame.op_stack.pop();
        arrayindex = frame.op_stack.pop();
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          if (arrayindex > array.length || arrayindex < 0) {
            athrow('ArrayIndexOutOfBoundsException');
          }
          array[arrayindex] = value;
          return thread.updateObject(array, function() {
            return false;
          }, this);
        }, this);
        return false;
      });
      this[87] = new OpCode('pop', 'Pops top stack word', function(frame) {
        frame.op_stack.pop();
        return true;
      });
      this[88] = new OpCode('pop2', 'Pops top two operand stack words', function(frame) {
        frame.op_stack.pop();
        frame.op_stack.pop();
        return true;
      });
      this[89] = new OpCode('dup', 'Duplicate top operand stack word', function(frame) {
        return frame.op_stack.push(frame.op_stack.peek());
      });
      this[90] = new OpCode('dup_x1', 'Duplicate top op stack word and put two down', function(frame) {
        var dupword, word1;
        dupword = frame.op_stack.pop();
        word1 = frame.op_stack.pop();
        frame.op_stack.push(dupword);
        frame.op_stack.push(word1);
        return frame.op_stack.push(dupword);
      });
      this[91] = new OpCode('dup_x2', 'Duplicate top op stack word and put three down', function(frame) {
        var dupword, word2, word3;
        dupword = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        frame.op_stack.push(dupword);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(dupword);
      });
      this[92] = new OpCode('dup2', 'Duplicate top op stack words', function(frame) {
        var word1, word2;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[93] = new OpCode('dup2_x1', 'Duplicate top two op stack words and put three down', function(frame) {
        var word1, word2, word3;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[94] = new OpCode('dup2_x2', 'Duplicate top two op stack words and put four down', function(frame) {
        var word1, word2, word3, word4;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        word3 = frame.op_stack.pop();
        word4 = frame.op_stack.pop();
        frame.op_stack.push(word2);
        frame.op_stack.push(word1);
        frame.op_stack.push(word4);
        frame.op_stack.push(word3);
        frame.op_stack.push(word2);
        return frame.op_stack.push(word1);
      });
      this[95] = new OpCode('swap', 'Swap top two operand stack words', function(frame) {
        var word1, word2;
        word1 = frame.op_stack.pop();
        word2 = frame.op_stack.pop();
        frame.op_stack.push(word1);
        return frame.op_stack.push(word2);
      });
      this[96] = new OpCode('iadd', 'Pops two values from the stack, adds them and pushes the result.', function(frame) {
        var i1, i2;
        i1 = frame.op_stack.pop();
        i2 = frame.op_stack.pop();
        if (isNaN(i1.valueOf()) || isNaN(i2.valueOf())) {
          frame.op_stack.push(new CONSTANT_integer(Number.NaN));
          return true;
        }
        return frame.op_stack.push(new CONSTANT_integer(i1 + i2));
      });
      this[97] = new OpCode('ladd', 'Add long', function(frame) {
        var long1a, long1b, long2a, long2b;
        long1a = frame.op_stack.pop().valueOf();
        long1b = frame.op_stack.pop().valueOf();
        long2a = frame.op_stack.pop().valueOf();
        long2b = frame.op_stack.pop().valueOf();
        if (isNaN(long1a.value) || isNaN(long2a.value)) {
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          return true;
        }
        frame.op_stack.push(new CONSTANT_long(long1a + long2a));
        return frame.op_stack.push(new CONSTANT_long(long1a + long2a));
      });
      this[98] = new OpCode('fadd', 'Add float', function(frame) {
        var float1, float2, result;
        float1 = frame.op_stack.pop().valueOf();
        float2 = frame.op_stack.pop().valueOf();
        if (isNaN(float1.value) || isNaN(float2.value)) {
          frame.op_stack.push(new CONSTANT_float(Number.NaN));
          return true;
        }
        result = float2.value + float1.value;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[99] = new OpCode('dadd', 'Add double', function(frame) {
        var da1, da2, db1, db2, result;
        da1 = frame.op_stack.pop().valueOf();
        da2 = frame.op_stack.pop().valueOf();
        db1 = frame.op_stack.pop().valueOf();
        db2 = frame.op_stack.pop().valueOf();
        if (isNaN(float1.value) || isNaN(float2.value)) {
          frame.op_stack.push(new CONSTANT_double(Number.NaN));
          frame.op_stack.push(new CONSTANT_double(Number.NaN));
          return true;
        }
        result = da1 + db1;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[100] = new OpCode('isub', 'Subtract int', function(frame) {
        var i1, i2, result;
        i2 = frame.op_stack.pop().valueOf();
        i1 = frame.op_stack.pop().valueOf();
        result = i1 - i2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[101] = new OpCode('lsub', 'Subtract long', function(frame) {
        var ia1, ia2, ib1, ib2, result;
        ia1 = frame.op_stack.pop().valueOf();
        ia2 = frame.op_stack.pop().valueOf();
        ib1 = frame.op_stack.pop().valueOf();
        ib2 = frame.op_stack.pop().valueOf();
        result = ib1 - ia1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[102] = new OpCode('fsub', 'Subtract float', function(frame) {
        var f1, f2, result;
        f2 = frame.op_stack.pop().valueOf();
        f1 = frame.op_stack.pop().valueOf();
        result = f1 - f2;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[103] = new OpCode('dsub', 'Subtract double', function(frame) {
        var d, d1, d2, d3, result;
        d = frame.op_stack.pop().valueOf();
        d1 = frame.op_stack.pop().valueOf();
        d2 = frame.op_stack.pop().valueOf();
        d3 = frame.op_stack.pop().valueOf();
        result = d - d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[104] = new OpCode('imul', 'Multiply int', function(frame) {
        var f1, f2, result;
        f2 = frame.op_stack.pop().valueOf();
        f1 = frame.op_stack.pop().valueOf();
        result = f1 * f2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[105] = new OpCode('lmul', 'Multiple long', function(frame) {
        var la1, la2, lb1, lb2, result;
        la1 = frame.op_stack.pop().valueOf();
        la2 = frame.op_stack.pop().valueOf();
        lb1 = frame.op_stack.pop().valueOf();
        lb2 = frame.op_stack.pop().valueOf();
        if (isNan(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
          frame.op_stack.push(new CONSTANT_long(Number.NaN));
        }
        result = lb1 * la1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[106] = new OpCode('fmul', 'Multiply float', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        result = value1 * value2;
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_float(Number.NaN));
        }
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[107] = new OpCode('dmul', 'Multiply double', function(frame) {
        var d, d1, d2, d3, result;
        d = frame.op_stack.pop().valueOf();
        d1 = frame.op_stack.pop().valueOf();
        d2 = frame.op_stack.pop().valueOf();
        d3 = frame.op_stack.pop().valueOf();
        result = d * d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[108] = new OpCode('idiv', 'Divide int', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_integer(Integer.NaN));
        }
        if (value2 === 0) {
          athrow('ArithmeticException');
        }
        result = value1 / value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[109] = new OpCode('ldiv', 'Divide long', function(frame) {
        var l1, l1a, l2, l2a, result;
        l2 = frame.op_stack.pop();
        l2a = frame.op_stack.pop();
        l1 = frame.op_stack.pop();
        l1a = frame.op_stack.pop();
        if (isNaN(l1) || isNaN(l2)) {
          frame.op_stack.push(new CONSTANT_long(Integer.NaN));
          frame.op_stack.push(new CONSTANT_long(Integer.NaN));
        }
        if (l2 === 0) {
          athrow('ArithmeticException');
        }
        result = l1 / l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[110] = new OpCode('fdiv', 'Divide float', function(frame) {
        var result, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_float(Integer.NaN));
        }
        if (value2 === 0) {
          athrow('ArithmeticException');
        }
        result = value1 / value2;
        return frame.op_stack.push(new CONSTANT_float(result));
      });
      this[111] = new OpCode('ddiv', 'Divide Double', function(frame) {
        var d1, d1a, d2, d2a, result;
        d2 = frame.op_stack.pop();
        d2a = frame.op_stack.pop();
        d1 = frame.op_stack.pop();
        d1a = frame.op_stack.pop();
        if (isNaN(value1) || isNaN(value2)) {
          frame.op_stack.push(new CONSTANT_double(Integer.NaN));
          frame.op_stack.push(new CONSTANT_double(Integer.NaN));
        }
        if (d2 === 0) {
          athrow('ArithmeticException');
        }
        result = d1 / d2;
        frame.op_stack.push(new CONSTANT_double(result));
        return frame.op_stack.push(new CONSTANT_double(result));
      });
      this[112] = new OpCode('irem', 'Remainder int', function(frame) {
        var i1, i2, result;
        i2 = frame.op_stack.pop().valueOf();
        i1 = frame.op_stack.pop().valueOf();
        if (i2 === 0) {
          athrow('ArithmeticException');
        }
        result = i1 - (i1 / i2) * i2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[113] = new OpCode('lrem', 'Remainder long', function(frame) {
        var l1, l2, result;
        l2 = frame.op_stack.pop().valueOf();
        l1 = frame.op_stack.pop().valueOf();
        if (l2 === 0) {
          athrow('ArithmeticException');
        }
        result = l1 - (l1 / l2) * l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[114] = new OpCode('frem', 'Remainder float', function(frame) {
        return thread.log('frem not implemented');
      });
      this[115] = new OpCode('drem', 'Remainder double', function(frame) {
        return thread.log('drem not implemented');
      });
      this[116] = new OpCode('ineg', 'Negate int', function(frame) {
        var result, value;
        value = frame.op_stack.pop().valueOf();
        result = (~value) + 1;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[117] = new OpCode('lneg', 'Negate long', function(frame) {
        var la, lb, result;
        la = frame.op_stack.pop().valueOf();
        lb = frame.op_stack.pop().valueOf();
        result = (~la) + 1;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[118] = new OpCode('fneg', 'Negate float', function(frame) {
        var result, value;
        value = frame.op_stack.pop().valueOf();
        result = new CONSTANT_double(~value.value + 1);
        return frame.op_stack.push(result);
      });
      this[119] = new OpCode('dneg', 'Negate double', function(frame) {
        var d1, d2, result;
        d1 = frame.op_stack.pop().valueOf();
        d2 = frame.op_stack.pop().valueOf();
        result = new CONSTANT_double(~d1.value + 1);
        frame.op_stack.push(result);
        return frame.op_stack.push(result);
      });
      this[120] = new OpCode('ishl', 'Arithmetic shift left int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x1f;
        result = value1 << s;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[121] = new OpCode('lshl', 'Arithmetic shift left long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x3f;
        result = value1 << s;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[122] = new OpCode('ishr', 'Arithmetic shift right int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x1f;
        result = value1 >> s;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[123] = new OpCode('lshr', 'Arithmetic shift right long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x3f;
        result = value1 >> s;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[124] = new OpCode('iushr', 'Logical shift right int', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x1f;
        if (value1 > 0) {
          result = value1 >> s;
        } else {
          result = (value1 >> s) + (2 << ~s);
        }
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[125] = new OpCode('lushr', 'Logical shift right long', function(frame) {
        var result, s, value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        s = value2 & 0x1f;
        if (value1 > 0) {
          result = value1 >> s;
        } else {
          result = (value1 >> s) + (2 << ~s);
        }
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[126] = new OpCode('iand', 'Boolean AND int', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().valueOf();
        value2 = frame.op_stack.pop().valueOf();
        result = value1 & value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[127] = new OpCode('land', 'Boolean ', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        value2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        result = value1 & value2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[128] = new OpCode('ior', '', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().valueOf();
        value2 = frame.op_stack.pop().valueOf();
        result = value1 | value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[129] = new OpCode('lor', 'Boolean OR long', function(frame) {
        var l1, l2, result;
        l1 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        l2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop().valueOf();
        result = l1 | l2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[130] = new OpCode('ixor', 'Boolean XOR int', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().valueOf();
        value2 = frame.op_stack.pop().valueOf();
        result = value1 ^ value2;
        return frame.op_stack.push(new CONSTANT_integer(result));
      });
      this[131] = new OpCode('lxor', 'Boolean XOR long', function(frame) {
        var result, value1, value2;
        value1 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop();
        value2 = frame.op_stack.pop().valueOf();
        frame.op_stack.pop();
        result = value1 ^ value2;
        frame.op_stack.push(new CONSTANT_long(result));
        return frame.op_stack.push(new CONSTANT_long(result));
      });
      this[132] = new OpCode('iinc', 'Increment local variable by constant', function(frame) {
        var consta, index, unsigned, variable;
        index = this.getIndexByte(1, frame, thread);
        unsigned = this.getIndexByte(1, frame, thread);
        consta = new CONSTANT_byte(unsigned, true);
        variable = frame.locals[index];
        variable.val = variable.val + consta.value;
        return frame.locals[index] = variable;
      });
      this[133] = new OpCode('i2l', 'Convert int to long', function(frame) {
        var long, value;
        value = frame.op_stack.pop().valueOf();
        long = new CONSTANT_long(value);
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[134] = new OpCode('i2f', 'Convert int to float', function(frame) {
        var float, value;
        value = frame.op_stack.pop().valueOf();
        float = new CONSTANT_float(value);
        return frame.op_stack.push(float);
      });
      this[135] = new OpCode('i2d', 'Convert int to double', function(frame) {
        var double, value;
        value = frame.op_stack.pop().valueOf();
        double = new CONSTANT_double(value);
        return frame.op_stack.push(double);
      });
      this[136] = new OpCode('l2i', 'Convert long to int', function(frame) {
        var int, value;
        value = frame.op_stack.pop().valueOf();
        int = new CONSTANT_integer(value.toFixed());
        return frame.op_stack.push(int);
      });
      this[137] = new OpCode('l2f', 'Convert long to float', function(frame) {
        var float, value;
        value = frame.op_stack.pop().valueOf();
        float = new CONSTANT_float(value);
        return frame.op_stack.push(float);
      });
      this[138] = new OpCode('l2d', 'Convert long to double', function(frame) {
        var double, value;
        value = frame.op_stack.pop().valueOf();
        double = new CONSTANT_double(value);
        return frame.op_stack.push(double);
      });
      this[139] = new OpCode('f2i', 'Convert float to int', function(frame) {
        var float, int;
        float = frame.op_stack.pop().valueOf();
        int = new CONSTANT_integer(float.toFixed());
        return frame.op_stack.push(int);
      });
      this[140] = new OpCode('f2l', 'Convert Float to long', function(frame) {
        var float, long;
        float = frame.op_stack.pop().valueOf();
        long = new CONSTANT_long(float.toFixed());
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[141] = new OpCode('f2d', 'Convert float to double', function(frame) {
        var double, float;
        float = frame.op_stack.pop().valueOf();
        double = new CONSTANT_double(float.value);
        frame.op_stack.push(double);
        return frame.op_stack.push(double);
      });
      this[142] = new OpCode('d2i', 'Convert double to int', function(frame) {
        var double, int;
        double = frame.op_stack.pop().valueOf();
        int = new CONSTANT_integer(float.toFixed());
        return frame.op_stack.push(int);
      });
      this[143] = new OpCode('d2l', 'Convert double to long', function(frame) {
        var double, long;
        double = frame.op_stack.pop().valueOf();
        frame.op_stack.pop();
        long = new CONSTANT_float(long.toFixed());
        frame.op_stack.push(long);
        return frame.op_stack.push(long);
      });
      this[144] = new OpCode('d2f', 'Convert double to float', function(frame) {
        var double, float;
        double = frame.op_stack.pop().valueOf();
        frame.op_stack.pop();
        float = new CONSTANT_float(double);
        return frame.op_stack.push(float);
      });
      this[145] = new OpCode('i2b', 'Convert int to byte', function(frame) {
        var byte, int;
        int = frame.op_stack.pop().valueOf();
        byte = new CONSTANT_byte(int);
        return frame.op_stack.push(byte);
      });
      this[146] = new OpCode('i2c', 'Convert int to char', function(frame) {
        var char, int;
        int = frame.op_stack.pop().valueOf();
        char = new CONSTANT_char(int);
        return frame.op_stack.push(char);
      });
      this[147] = new OpCode('i2s', 'Convert int to short', function(frame) {
        var int, short;
        int = frame.op_stack.pop().valueOf();
        short = new CONSTANT_short(int);
        return frame.op_stack.push(short);
      });
      this[148] = new OpCode('lcmp', 'Compare long', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().valueOf();
        value2b = frame.op_stack.pop().valueOf();
        value1a = frame.op_stack.pop().valueOf();
        value1b = frame.op_stack.pop().valueOf();
        if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[149] = new OpCode('fcmpl', 'Compare float, push -1 for NaN', function(frame) {
        var value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        if (isNaN(value1) || isNaN(value2)) {
          return frame.op_stack.push(-1);
        } else if (value1 > value2) {
          return frame.op_stack.push(1);
        } else if (value1 === value2) {
          return frame.op_stack.push(0);
        } else if (value1 < value2) {
          return frame.op_stack.push(-1);
        }
      });
      this[150] = new OpCode('fcmpg', 'Compare float, push 1 for NaN', function(frame) {
        var value1, value2;
        value2 = frame.op_stack.pop().valueOf();
        value1 = frame.op_stack.pop().valueOf();
        if (isNaN(value1) || isNaN(value2)) {
          return frame.op_stack.push(1);
        } else if (value1 > value2) {
          return frame.op_stack.push(1);
        } else if (value1 === value2) {
          return frame.op_stack.push(0);
        } else if (value1 < value2) {
          return frame.op_stack.push(-1);
        }
      });
      this[151] = new OpCode('dcmpl', 'Compare double, push -1 for NaN', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().valueOf();
        value2b = frame.op_stack.pop().valueOf();
        value1a = frame.op_stack.pop().valueOf();
        value1b = frame.op_stack.pop().valueOf();
        if (isNaN(value1a) || isNaN(value2a)) {
          return frame.op_stack.push(-1);
        } else if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[152] = new OpCode('dcmpg', 'Compare double, push 1 for NaN', function(frame) {
        var value1a, value1b, value2a, value2b;
        value2a = frame.op_stack.pop().valueOf();
        value2b = frame.op_stack.pop().valueOf();
        value1a = frame.op_stack.pop().valueOf();
        value1b = frame.op_stack.pop().valueOf();
        if (isNaN(value1a) || isNaN(value2a)) {
          return frame.op_stack.push(1);
        } else if (value1a > value2a) {
          return frame.op_stack.push(1);
        } else if (value1a === value2a) {
          return frame.op_stack.push(0);
        } else if (value1a < value2a) {
          return frame.op_stack.push(-1);
        }
      });
      this[153] = new OpCode('ifeq', 'Branch if value is 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() === 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[154] = new OpCode('ifne', 'Branch if value isnt 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop().valueOf() !== 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[155] = new OpCode('iflt', 'Branch if value < 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() < 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[156] = new OpCode('ifge', 'Branch if value >= 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() >= 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[157] = new OpCode('ifgt', 'Branch if value > 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() > 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[158] = new OpCode('ifle', 'Branch if value <= 0', function(frame) {
        var branch;
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (frame.op_stack.pop() <= 0) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[159] = new OpCode('if_icmpeq', 'Branch if int1 == int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 === value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[160] = new OpCode('if_icmpne', 'Branch if int1 != int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 !== value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[161] = new OpCode('if_icmplt', 'Branch if int1 < int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 < value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[162] = new OpCode('if_icmpge', 'Branch if int1 >= int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 >= value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[163] = new OpCode('if_icmpgt', 'Branch if int1 > int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 > value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[164] = new OpCode('if_icmple', 'Branch if int1 <= int2', function(frame) {
        var branch, value1, value2;
        value2 = frame.op_stack.pop();
        value1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (value1 <= value2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[165] = new OpCode('if_acmpeq', 'Branch if ref1 === ref2', function(frame) {
        var branch, ref1, ref2;
        ref2 = frame.op_stack.pop();
        ref1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (ref1 === ref2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[166] = new OpCode('if_acmpne', 'Branch if ref1 !== ref2', function(frame) {
        var branch, ref1, ref2;
        ref2 = frame.op_stack.pop();
        ref1 = frame.op_stack.pop();
        branch = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        if (ref1 !== ref2) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[167] = new OpCode('goto', 'Branch always', function(frame) {
        var offset;
        offset = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        thread.pc -= 3;
        return thread.pc += offset;
      });
      this[168] = new OpCode('jsr', 'Jump to subroutine', function(frame) {
        var offset;
        frame.op_stack.push(thread.pc);
        offset = new CONSTANT_integer(this.constructIndex(frame, thread), true);
        thread.pc -= 3;
        return thread.pc += offset;
      });
      this[169] = new OpCode('ret', 'Return from subroutine', function(frame) {
        var index;
        index = this.getByteIndex(1);
        return thread.pc = frame.locals[index];
      });
      this[170] = new OpCode('tableswitch', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[171] = new OpCode('lookupswitch', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[172] = new OpCode('ireturn', 'Return an int', function(frame) {
        var invoker, ireturn;
        ireturn = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(ireturn);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[173] = new OpCode('lreturn', 'Return long from method', function(frame) {
        var invoker, retlong;
        retlong = frame.op_stack.pop();
        frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retlong);
        invoker.op_stack.push(retlong);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[174] = new OpCode('freturn', 'Return float from method', function(frame) {
        var invoker, retfloat;
        retfloat = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retfloat);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[175] = new OpCode('dreturn', 'Return double from method', function(frame) {
        var invoker, retdouble;
        retdouble = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        invoker.op_stack.push(retdouble);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[176] = new OpCode('areturn', 'Return reference', function(frame) {
        var invoker, returnref;
        returnref = frame.op_stack.pop();
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        if (invoker === void 0) {
          return true;
        }
        invoker.op_stack.push(returnref);
        thread.current_frame = invoker;
        thread.current_class = invoker.cls;
        return thread.pc = invoker.pc;
      });
      this[177] = new OpCode('return', 'Return void from method', function(frame) {
        var invoker;
        if (thread.current_frame instanceof NativeFrame) {
          thread.native_stack.pop();
          if ((thread.native_stack.peek() != null)) {
            thread.current_frame = thread.native_stack.peek();
          } else {
            thread.current_frame = thread.jvm_stack.peek();
          }
        } else {
          thread.jvm_stack.pop();
        }
        invoker = thread.jvm_stack.peek();
        thread.current_frame = invoker;
        if (thread.current_frame != null) {
          thread.pc = thread.current_frame.pc;
          thread.current_class = invoker.cls;
        }
        return true;
      });
      this[178] = new OpCode('getstatic', 'Fetch static field from class', function(frame) {
        var class_field_ref, class_ref, field_name, field_name_type, ref;
        ref = this.constructIndex(frame, thread);
        class_field_ref = this.fromCP(ref, thread);
        class_ref = this.fromCP(class_field_ref.class_index, thread);
        field_name_type = this.fromCP(class_field_ref.name_and_type_index, thread);
        field_name = this.fromCP(field_name_type.name_index, thread);
        thread.getStatic(class_ref, field_name, function(value) {
          return frame.op_stack.push(value);
        });
        return false;
      });
      this[179] = new OpCode('putstatic', 'Set static field in class', function(frame) {
        var class_field_ref, class_ref, field_name, field_name_type, ref, value;
        ref = this.constructIndex(frame, thread);
        class_field_ref = this.fromCP(ref, thread);
        class_ref = this.fromCP(class_field_ref.class_index, thread);
        field_name_type = this.fromCP(class_field_ref.name_and_type_index, thread);
        field_name = this.fromCP(field_name_type.name_index, thread);
        value = frame.op_stack.pop();
        thread.setStatic(class_ref, field_name, value);
        return false;
      });
      this[180] = new OpCode('getfield', 'Get a field from an object', function(frame) {
        var fieldname, fieldref, index, nameandtype, objectref;
        objectref = frame.op_stack.pop();
        if (this.isNull(objectref)) {
          athrow('NullPointerException');
        }
        index = this.constructIndex(frame, thread);
        fieldref = this.fromCP(index, thread);
        nameandtype = this.fromCP(fieldref.name_and_type_index, thread);
        fieldname = this.fromCP(nameandtype.name_index, thread);
        thread.getObjectField(objectref, fieldname, function(field) {
          return frame.op_stack.push(field);
        }, this);
        return false;
      });
      this[181] = new OpCode('putfield', 'Set a field in an object', function(frame) {
        var fieldname, fieldref, index, nameandtype, objectref, value;
        objectref = frame.op_stack.pop();
        if (this.isNull(objectref)) {
          athrow('NullPointerException');
        }
        value = frame.op_stack.pop();
        index = this.constructIndex(frame, thread);
        fieldref = this.fromCP(index, thread);
        nameandtype = this.fromCP(fieldref.name_and_type_index, thread);
        fieldname = this.fromCP(nameandtype.name_index, thread);
        thread.setObjectField(objectref, fieldname, value);
        return false;
      });
      this[182] = new OpCode('invokevirtual', 'Invoke instance method; dispatch based on class', function(frame) {
        var classname, descriptor, index, method_name, methodnameandtype, methodref;
        index = this.constructIndex(frame, thread);
        methodref = this.fromCP(index, thread);
        classname = this.fromCP(methodref.class_index, thread);
        methodnameandtype = this.fromClass(methodref.name_and_type_index, thread);
        method_name = this.fromCP(methodnameandtype.name_index, thread);
        descriptor = this.fromCP(methodnameandtype.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, objectref;
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
            athrow('IncompatibleClassChangeError');
          }
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_ABSTRACT) {
            athrow('AbstractMethodError');
          }
          newframe = thread.createFrame(method, method.belongsTo);
          thread.current_class = method.belongsTo;
          frame.pc += 2;
          thread.pc = -1;
          arg_num = method.nargs;
          while (arg_num > 0) {
            newframe.locals[arg_num--] = frame.op_stack.pop();
          }
          objectref = frame.op_stack.pop();
          newframe.locals[0] = objectref;
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_SYNCHRONIZED) {
            return thread.aquireLock(objectref);
          }
        }, this);
        return false;
      });
      this[183] = new OpCode('invokespecial', 'Invoke instance method', function(frame) {
        var classname, descriptor, method_name, method_name_and_type, methodref;
        methodref = this.fromCP(this.constructIndex(frame, thread), thread);
        classname = this.fromCP(methodref.class_index, thread);
        method_name_and_type = this.fromCP(methodref.name_and_type_index, thread);
        method_name = this.fromCP(method_name_and_type.name_index, thread);
        descriptor = this.fromCP(method_name_and_type.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, objectref;
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_PRIVATE) {
            athrow('RuntimeException');
          }
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC) {
            athrow('IncompatibleClassChangeError');
          }
          if (method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_ABSTRACT) {
            athrow('AbstractMethodError');
          }
          newframe = thread.createFrame(method, method.belongsTo);
          thread.current_class = method.belongsTo;
          frame.pc += 2;
          thread.pc = -1;
          arg_num = method.nargs;
          while (arg_num > 0) {
            newframe.locals[arg_num--] = frame.op_stack.pop();
          }
          objectref = frame.op_stack.pop();
          if (this.isNull(objectref)) {
            athrow('NullPointerException');
          }
          return newframe.locals[0] = objectref;
        }, this);
        return false;
      });
      this[184] = new OpCode('invokestatic', 'Invoke class (static) method', function(frame) {
        var classname, descriptor, method_name, method_name_and_type, methodref;
        methodref = this.fromCP(this.constructIndex(frame, thread), thread);
        classname = this.fromCP(methodref.class_index, thread);
        method_name_and_type = this.fromCP(methodref.name_and_type_index, thread);
        method_name = this.fromCP(method_name_and_type.name_index, thread);
        descriptor = this.fromCP(method_name_and_type.descriptor_index, thread);
        thread.resolveMethod(method_name, classname, descriptor, function(method) {
          var arg_num, newframe, _results;
          if (!(method.access_flags & JVM_RECOGNIZED_METHOD_MODIFIERS.JVM_ACC_STATIC)) {
            athrow('IncompatibleClassChangeError');
          }
          newframe = thread.createFrame(method, method.belongsTo);
          thread.current_class = method.belongsTo;
          frame.pc += 2;
          thread.pc = -1;
          arg_num = method.nargs;
          _results = [];
          while (arg_num > 0) {
            _results.push(newframe.locals[--arg_num] = frame.op_stack.pop());
          }
          return _results;
        }, this);
        return false;
      });
      this[185] = new OpCode('invokeinterface', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[186] = new OpCode('xxxunusedxxx', '', function(frame) {
        return thread.log(this.mnemonic);
      }, true);
      this[187] = new OpCode('new', 'Create new Object', function(frame) {
        var clsref, index;
        index = this.constructIndex(frame, thread);
        clsref = this.fromCP(index, thread);
        thread.resolveClass(clsref, function(cls) {
          if (cls.access_flags & JVM_RECOGNIZED_CLASS_MODIFIERS.JVM_ACC_INTERFACE || cls.access_flags & JVM_RECOGNIZED_CLASS_MODIFIERS.JVM_ACC_ABSTRACT) {
            athrow('InstantiationException');
          }
          thread.allocate(new JVM_Object(cls), function(objectref) {
            return frame.op_stack.push(objectref);
          }, this);
          return false;
        }, this);
        return false;
      });
      this[188] = new OpCode('newarray', 'Create a new array', function(frame) {
        var arrayref, atype, count, t;
        atype = this.getIndexByte(1, frame, thread);
        count = frame.op_stack.pop();
        if (count < 0) {
          athrow('NegativeArraySizeException');
        }
        switch (atype) {
          case 4:
            t = 'Z';
            break;
          case 5:
            t = 'C';
            break;
          case 6:
            t = 'F';
            break;
          case 7:
            t = 'D';
            break;
          case 8:
            t = 'B';
            break;
          case 9:
            t = 'S';
            break;
          case 10:
            t = 'I';
            break;
          case 11:
            t = 'J';
        }
        arrayref = thread.allocate(new CONSTANT_Array(count, t), function() {
          return frame.op_stack.push(arrayref);
        });
        return false;
      });
      this[189] = new OpCode('anewarray', 'Create new array of reference', function(frame) {
        var classname, count;
        classname = this.constructIndex(frame, thread);
        count = frame.op_stack.pop();
        if (count < 0) {
          athrow('NegativeArraySizeException');
        }
        thread.resolveClass(classname, function(cls) {
          var arr, arrayref;
          arr = new CONSTANT_Array(count, 'L' + cls.real_name);
          while (count-- > 0) {
            arr[count] = new JVM_Reference(0);
          }
          arrayref = thread.allocate(arr, function() {
            return frame.op_stack.push(arrayref);
          }, this);
          return false;
        }, this);
        return false;
      });
      this[190] = new OpCode('arraylength', 'Get length of array', function(frame) {
        var arrayref;
        arrayref = frame.op_stack.pop();
        if (this.isNull(arrayref)) {
          athrow('NullPointerException');
        }
        thread.getObject(arrayref, function(array) {
          return frame.op_stack.push(array.length);
        }, this);
        return false;
      });
      this[191] = new OpCode('athrow', 'Throw exception or error', function(frame) {
        var caught, objectref, _results;
        objectref = frame.op_stack.pop();
        if (this.isNull(ojectref)) {
          athrow("NullPointerException");
        }
        caught = false;
        _results = [];
        while (!caught) {
          thread.current_frame.att;
          thread.jvm_stack.pop();
          _results.push(thread.current_frame = thread.jvm_stack.peek());
        }
        return _results;
      });
      this[192] = new OpCode('checkcast', 'Check if object is of a given type', function(frame) {
        var clsindex, objectref;
        objectref = frame.op_stack.peek();
        clsindex = this.constructIndex(frame, thread);
        thread.getObject(objectref, function(S) {
          if (this.isNull(S)) {
            return true;
          }
          thread.resolveClass(clsindex, function(T) {
            if (T.real_name === S.cls.real_name) {
              frame.op_stack.push(objectref);
              return true;
              return athrow('ClassCastException');
            }
          }, this);
          return false;
        }, this);
        return false;
      });
      this[193] = new OpCode('instanceof', 'Check if object is an instance of class', function(frame) {
        var clsindex, objectref;
        objectref = frame.op_stack.pop();
        clsindex = this.fromClass(this.constructIndex(frame, thread), thread);
        thread.resolveClass(clsindex, function(cls) {
          thread.getObject(objectref, function(object) {
            if (cls.real_name === object.cls.real_name) {
              return frame.op_stack.push(1);
            } else {
              return frame.op_stack.push(0);
            }
          }, this);
          return false;
        }, this);
        return false;
      });
      this[194] = new OpCode('monitorenter', 'Enter monitor for object', function(frame) {
        var object;
        object = frame.op_stack.pop();
        thread.aquireLock(object);
        return false;
      });
      this[195] = new OpCode('monitorexit', '', function(frame) {
        var objectref;
        objectref = frame.op_stack.pop();
        thread.releaseLock(objectref);
        return false;
      });
      this[196] = new OpCode('wide', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[197] = new OpCode('multianewarray', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[198] = new OpCode('ifnull', 'Branch if null', function(frame) {
        var branch, value;
        branch = this.constructIndex(frame, thread);
        value = frame.op_stack.pop();
        if (this.isNull(value)) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[199] = new OpCode('ifnonnull', 'Branch if non-null', function(frame) {
        var branch, value;
        branch = this.constructIndex(frame, thread);
        value = frame.op_stack.pop();
        if (!this.isNull(value.pointer)) {
          thread.pc -= 3;
          thread.pc += branch;
        }
        return true;
      });
      this[200] = new OpCode('goto_w', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[201] = new OpCode('jsr_w', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[202] = new OpCode('breakpoint', '', function(frame) {
        return alert(this.mnemonic);
      }, true);
      this[203] = new OpCode('', '', function(frame) {}, true);
      this[204] = new OpCode('', '', function(frame) {}, true);
      this[205] = new OpCode('', '', function(frame) {}, true);
      this[206] = new OpCode('', '', function(frame) {}, true);
      this[207] = new OpCode('', '', function(frame) {}, true);
      this[208] = new OpCode('', '', function(frame) {}, true);
      this[209] = new OpCode('', '', function(frame) {}, true);
      this[210] = new OpCode('', '', function(frame) {}, true);
      this[211] = new OpCode('', '', function(frame) {}, true);
      this[212] = new OpCode('', '', function(frame) {}, true);
      this[213] = new OpCode('', '', function(frame) {}, true);
      this[214] = new OpCode('', '', function(frame) {}, true);
      this[215] = new OpCode('', '', function(frame) {}, true);
      this[216] = new OpCode('', '', function(frame) {}, true);
      this[217] = new OpCode('', '', function(frame) {}, true);
      this[218] = new OpCode('', '', function(frame) {}, true);
      this[219] = new OpCode('', '', function(frame) {}, true);
      this[220] = new OpCode('', '', function(frame) {}, true);
      this[221] = new OpCode('', '', function(frame) {}, true);
      this[222] = new OpCode('', '', function(frame) {}, true);
      this[223] = new OpCode('', '', function(frame) {}, true);
      this[224] = new OpCode('', '', function(frame) {}, true);
      this[225] = new OpCode('', '', function(frame) {}, true);
      this[226] = new OpCode('', '', function(frame) {}, true);
      this[227] = new OpCode('', '', function(frame) {}, true);
      this[228] = new OpCode('', '', function(frame) {}, true);
      this[229] = new OpCode('', '', function(frame) {}, true);
      this[230] = new OpCode('', '', function(frame) {}, true);
      this[231] = new OpCode('', '', function(frame) {}, true);
      this[232] = new OpCode('', '', function(frame) {}, true);
      this[233] = new OpCode('', '', function(frame) {}, true);
      this[234] = new OpCode('', '', function(frame) {}, true);
      this[235] = new OpCode('', '', function(frame) {}, true);
      this[236] = new OpCode('', '', function(frame) {}, true);
      this[237] = new OpCode('', '', function(frame) {}, true);
      this[238] = new OpCode('', '', function(frame) {}, true);
      this[239] = new OpCode('', '', function(frame) {}, true);
      this[240] = new OpCode('', '', function(frame) {}, true);
      this[241] = new OpCode('', '', function(frame) {}, true);
      this[242] = new OpCode('', '', function(frame) {}, true);
      this[243] = new OpCode('', '', function(frame) {}, true);
      this[244] = new OpCode('', '', function(frame) {}, true);
      this[245] = new OpCode('', '', function(frame) {}, true);
      this[246] = new OpCode('', '', function(frame) {}, true);
      this[247] = new OpCode('', '', function(frame) {}, true);
      this[248] = new OpCode('', '', function(frame) {}, true);
      this[249] = new OpCode('', '', function(frame) {}, true);
      this[250] = new OpCode('', '', function(frame) {}, true);
      this[251] = new OpCode('', '', function(frame) {}, true);
      this[252] = new OpCode('', '', function(frame) {}, true);
      this[253] = new OpCode('', '', function(frame) {}, true);
      this[254] = new OpCode('impdep1', '', function(frame) {}, true);
      this[255] = new OpCode('impdep2', '', function(frame) {}, true);
    }
    return OpCodes;
  })();
  OpCode = (function() {
    function OpCode(mnemonic, description, _do) {
      this.mnemonic = mnemonic;
      this.description = description;
      this["do"] = _do;
      this;
    }
    OpCode.prototype.isNull = function(objectref) {
      return objectref === null || objectref.pointer === 0;
    };
    OpCode.prototype.getIndexByte = function(index, frame, thread) {
      index = frame.method_stack[thread.pc + index];
      thread.pc++;
      return index;
    };
    OpCode.prototype.fromCP = function(index, thread) {
      var item;
      item = thread.current_class.constant_pool[index];
      while (typeof item === 'number') {
        item = thread.current_class.constant_pool[index];
      }
      return item;
    };
    OpCode.prototype.constructIndex = function(frame, thread) {
      var indexbyte1, indexbyte2;
      indexbyte1 = this.getIndexByte(1, frame, thread);
      indexbyte2 = this.getIndexByte(1, frame, thread);
      return indexbyte1 << 8 | indexbyte2;
    };
    OpCode.prototype.fromHeap = function(ref, thread) {
      return thread.getObject(ref);
    };
    OpCode.prototype.athrow = function(exception) {
      throw exception;
    };
    return OpCode;
  })();
}).call(this);
