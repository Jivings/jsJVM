(function() {
  var ClassReader, compatibility, dataTypes, jDataView, type, _fn;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  this.ClassLoader = (function() {
    ClassLoader.prototype.classReader = 1;
    ClassLoader.prototype.stack = new Array;
    ClassLoader.prototype.ps_id = 0;
    ClassLoader.prototype.required_classes = ['java/lang/Class', 'java/lang/String'];
    ClassLoader.prototype.loaded_classes = {};
    ClassLoader.prototype.postMessage = function(data) {
      return this.find(data.classname, data.waitingThreads);
    };
    /*
      Constructor 
      Set runtime data area and grab console from global scope
      */
    function ClassLoader(returnMethod, returnNative) {
      this.returnMethod = returnMethod;
      this.returnNative = returnNative;
      this.console = {
        debug: function(message) {
          return console.log(message);
        },
        print: function(message) {
          return console.log(message);
        }
      };
    }
    /*
        To be called on instanstiation.
        Seperate to Constructor so that the JVM can resolve required classes and 
        their native counterparts. 
      */
    ClassLoader.prototype.init = function(callback) {
      var cls, index, _ref;
      _ref = this.required_classes;
      for (index in _ref) {
        cls = _ref[index];
        this.find(cls);
      }
      return true;
    };
    ClassLoader.prototype.findNative = function(name) {
      var req, _native;
      _native = null;
      req = new XMLHttpRequest();
      req.open('GET', "js/classes/" + name + ".js", false);
      req.send(null);
      if (req.status === 200) {
        try {
          eval("_native = (" + req.responseText + ")");
        } catch (err) {
          console.log("" + name);
          throw err;
        }
        _native = new _native();
        this.returnNative(name, _native);
        return _native;
      } else {
        throw 'NoClassDefFoundError';
      }
    };
    /*
      Finds a class on the classpath
      */
    ClassLoader.prototype.find = function(class_name) {
      var classReader, req, _class;
      if ((this.loaded_classes[class_name] != null)) {
        return this.loaded_classes[class_name];
      }
      if (typeof class_name === 'undefined') {
        return;
      }
      req = new XMLHttpRequest();
      req.open('GET', "js/classes/rt/" + class_name + ".class", false);
      req.overrideMimeType('text/plain; charset=x-user-defined');
      req.send(null);
      if (req.status !== 200) {
        req.open('GET', "js/classes/" + class_name + ".class", false);
        req.overrideMimeType('text/plain; charset=x-user-defined');
        req.send(null);
        if (req.status !== 200) {
          throw 'NoClassDefFoundError';
        }
      }
      classReader = new ClassReader(req.responseText);
      _class = classReader.parse();
      this.find(_class.get_super(), false, this.returnMethod);
      this.loaded_classes[_class.get_name()] = _class;
      this.returnMethod(_class.get_name(), _class);
      return _class;
    };
    return ClassLoader;
  })();
  /*
  ClassReader
  */
  ClassReader = (function() {
    function ClassReader(stream) {
      this.binaryReader = new jDataView(stream);
      this.binaryReader._littleEndian = false;
      this.console = {
        debug: function() {
          return true;
        },
        writeConstant: function() {
          return true;
        }
      };
    }
    ClassReader.prototype.parse = function() {
      var _class;
      _class = new CONSTANT_Class();
      this.parseClassVars(_class);
      this.parseConstantPool(_class);
      this.parseFileVars(_class);
      this.parseInterfaces(_class);
      this.parseFields(_class);
      this.parseMethods(_class);
      return _class;
    };
    ClassReader.prototype.read = function(length) {
      switch (length) {
        case 1:
          return this.binaryReader.getUint8();
        case 2:
          return this.binaryReader.getUint16();
        case 4:
          return this.binaryReader.getUint32();
        default:
          return this.binaryReader.seek(this.binaryReader.tell() + length);
      }
    };
    ClassReader.prototype.readDouble = function() {
      return this.binaryReader.getFloat32();
    };
    ClassReader.prototype.readString = function(length) {
      return this.binaryReader.getString(length);
    };
    ClassReader.prototype.readTag = function() {
      return this.read(1);
    };
    ClassReader.prototype.readConstant = function(tag) {
      switch (tag) {
        case 1:
          return this.readString(this.read(2));
        case 3:
          return new CONSTANT_integer(this.binaryReader.getUint32());
        case 4:
          return new CONSTANT_float(this.binaryReader.getUint32());
        case 5:
          return new CONSTANT_long(this.binaryReader.getFloat64());
        case 6:
          return new CONSTANT_double(this.binaryReader.getFloat64());
        case 7:
          return this.read(2);
        case 8:
          return new CONSTANT_Stringref(this.read(2));
        case 9:
          return new CONSTANT_Fieldref_info(this.read(2), this.read(2));
        case 10:
          return new CONSTANT_Methodref_info(this.read(2), this.read(2));
        case 12:
          return new CONSTANT_NameAndType_info(this.read(2), this.read(2));
        case 11:
          return this.read(4);
        default:
          throw "UnknownConstantException, Offset : " + this.binaryReader.tell();
      }
    };
    ClassReader.prototype.parseClassVars = function(_class) {
      var valid;
      this.console.debug('magic number: ' + (_class.magic_number = this.read(4)), 2);
      valid = _class.magic_number.toString(16) & 0xCAFEBABE;
      if (valid !== 0) {
        alert("Not JavaClass");
      }
      this.console.debug('minor version: ' + (_class.minor_version = this.read(2)), 2);
      this.console.debug('major version: ' + (_class.major_version = this.read(2)), 2);
      return true;
    };
    ClassReader.prototype.parseConstantPool = function(_class) {
      var constant, i, tag;
      _class.constant_pool_count = this.read(2);
      i = 0;
      this.console.debug("Constant Pool Count : " + _class.constant_pool_count, 2);
      while (++i < _class.constant_pool_count) {
        tag = this.readTag();
        constant = this.readConstant(tag);
        _class.constant_pool[i] = constant;
        this.console.writeConstant(i, tag, constant, 2);
        if (tag === 5 || tag === 6) {
          i++;
        } else if (tag === 7) {
          if (constant !== _class.this_class) {
            _class.dependancies.push(constant);
          }
        }
      }
      return true;
    };
    ClassReader.prototype.parseFileVars = function(_class) {
      this.console.debug('access flags: ' + (_class.access_flags = this.read(2)), 2);
      this.console.debug('this class: ' + (_class.this_class = this.read(2)), 2);
      _class.super_class = this.read(2);
      this.console.debug('super class: ' + _class.super_class, 2);
      _class.real_name = _class.constant_pool[_class.constant_pool[_class.this_class]];
      return true;
    };
    ClassReader.prototype.parseInterfaces = function(_class) {
      var i;
      this.console.debug('interface count: ' + (_class.interfaces_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.interfaces_count) {
        this.console.debug(_class.interfaces[i] = this.read(2), 2);
      }
      return true;
    };
    ClassReader.prototype.parseFields = function(_class) {
      var field, i;
      this.console.debug('fields count: ' + (_class.fields_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.fields_count) {
        field = this.readFieldInfo(_class);
        _class.fields[field[1].real_name] = field[0];
      }
      return true;
    };
    ClassReader.prototype.parseMethods = function(_class) {
      var i, method;
      this.console.debug('method count: ' + (_class.method_count = this.read(2)), 2);
      i = -1;
      while (++i < _class.method_count) {
        method = this.readMethodInfo(_class);
        _class.methods[i] = method;
      }
      return true;
    };
    ClassReader.prototype.parseAttributes = function(_class) {
      return _class.attributes_count(this.read(2));
    };
    ClassReader.prototype.readMethodInfo = function(_class) {
      var attr, i, method_info;
      method_info = {};
      this.console.debug('  access flags: ' + (method_info.access_flags = this.read(2)), 2);
      this.console.debug('  name index: ' + (method_info.name_index = this.read(2)), 2);
      method_info.name = _class.constant_pool[method_info.name_index];
      this.console.debug('  descriptor index: ' + (method_info.descriptor_index = this.read(2)), 2);
      this.console.debug('  atrribute count: ' + (method_info.attribute_count = this.read(2)), 2);
      method_info.attributes = new Array(method_info.attribute_count);
      i = 0;
      while (i++ < method_info.attribute_count) {
        attr = this.readAttribute(_class);
        method_info.attributes[attr.real_name] = attr;
      }
      return method_info;
    };
    ClassReader.prototype.readAttribute = function(_class) {
      var attribute_length, attribute_name, real_name;
      attribute_name = this.read(2);
      attribute_length = this.read(4);
      real_name = _class.constant_pool[attribute_name];
      this.console.debug('    attribute name: ' + real_name, 2);
      this.console.debug('    attribute length: ' + attribute_length, 2);
      if (real_name === 'Code') {
        return this.readCodeAttribute(_class, attribute_name, attribute_length);
      } else {
        this.read(attribute_length);
        return {};
      }
    };
    ClassReader.prototype.readCodeAttribute = function(_class, name_index, length) {
      var code_attribute, code_length, i;
      code_attribute = {};
      code_attribute.attribute_name_index = name_index;
      code_attribute.real_name = _class.constant_pool[name_index];
      code_attribute.attribute_length = length;
      code_attribute.max_stack = this.read(2);
      code_attribute.max_locals = this.read(2);
      code_attribute.code_length = this.read(4);
      code_attribute.code = {};
      code_length = code_attribute.code_length;
      i = -1;
      while (++i < code_length) {
        this.console.debug('      ' + (code_attribute.code[i] = this.read(1)), 2);
      }
      code_attribute.exception_table_length = this.read(2);
      this.read(code_attribute.exception_table_length * 8);
      code_attribute.attributes_count = this.read(2);
      code_attribute.attributes = new Array(code_attribute.attributes_count);
      i = -1;
      while (++i < code_attribute.attributes_count) {
        code_attribute.attributes[i] = this.readAttribute(_class);
      }
      return code_attribute;
    };
    ClassReader.prototype.readFieldInfo = function(_class) {
      var c, descriptor, field_info, i;
      field_info = {};
      this.console.debug('  access flags: ' + (field_info.access_flags = this.read(2)), 2);
      this.console.debug('  name index: ' + (field_info.name_index = this.read(2)), 2);
      this.console.debug('  descriptor index: ' + (field_info.descriptor_index = this.read(2)), 2);
      this.console.debug('  atrribute count: ' + (field_info.attribute_count = this.read(2)), 2);
      field_info.attributes = new Array(field_info.attribute_count);
      field_info.real_name = _class.constant_pool[field_info.name_index];
      i = 0;
      while (i++ < field_info.attribute_count) {
        field_info.attributes[i] = this.readAttribute(_class);
      }
      descriptor = _class.constant_pool[field_info.descriptor_index];
      if (descriptor === 'I') {
        c = new CONSTANT_integer();
      }
      if (descriptor === 'J') {
        c = new CONSTANT_long();
      }
      if (descriptor === 'F') {
        c = new CONSTANT_float();
      }
      if (descriptor === 'D') {
        c = new CONSTANT_double();
      }
      if (descriptor === 'S') {
        c = new CONSTANT_short();
      }
      if (descriptor === 'Z') {
        c = new CONSTANT_boolean();
      }
      if (descriptor === 'C') {
        c = new CONSTANT_char();
      }
      if (descriptor === 'B') {
        c = new CONSTANT_byte();
      }
      if (descriptor.charAt(0) === 'L') {
        c = new JVM_Reference(0);
      }
      if (descriptor.charAt(0) === '[') {
        c = new JVM_Reference(0);
      }
      return [c, field_info];
    };
    return ClassReader;
  })();
  /*
  Represents a Java Class file. Also provides Class verification methods.
  @returns {JavaClass}
  */
  this.CONSTANT_Class = (function() {
    __extends(CONSTANT_Class, JVM_Object);
    function CONSTANT_Class() {
      this.magic_number = 0;
      this.minor_version = 0;
      this.major_version = 0;
      this.constant_pool_count = 0;
      this.constant_pool = [];
      this.access_flags = 0;
      this.this_class = 0;
      this.super_class = 0;
      this.interfaces_count = 0;
      this.interfaces = [];
      this.fields_count = 0;
      this.fields = {};
      this.methods_count = 0;
      this.methods = {};
      this.attributes_count = 0;
      this.attributes = [];
      this.dependancies = [];
      this.real_name = 'None';
    }
    CONSTANT_Class.prototype.get_super = function() {
      var cls;
      cls = this.constant_pool[this.super_class];
      while (typeof cls === 'number') {
        cls = this.constant_pool[cls];
      }
      return cls;
    };
    CONSTANT_Class.prototype.get_name = function() {
      var super_ref;
      super_ref = this.constant_pool[this.this_class];
      return this.constant_pool[super_ref];
    };
    CONSTANT_Class.prototype.set_method_count = function(count) {
      this.methods_count = parseInt(count, 16);
      this.methods = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_constant_pool_count = function(count) {
      this.constant_pool_count = parseInt(count, 16);
      this.constant_pool = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_interfaces_count = function(count) {
      this.interfaces_count = parseInt(count, 16);
      this.interfaces = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_fields_count = function(count) {
      this.fields_count = parseInt(count, 16);
      this.fields = new Array(parseInt(count, 16));
      return count;
    };
    CONSTANT_Class.prototype.set_attributes_count = function(count) {
      this.attributes_count = parseInt(count, 16);
      this.attributes = new Array(parseInt(count, 16));
      return count;
    };
    return CONSTANT_Class;
  })();
  /*
  `
  compatibility = {
  ArrayBuffer: typeof ArrayBuffer !== 'undefined',
  DataView: typeof DataView !== 'undefined' && 'getFloat64' in DataView.prototype
  }
  
  jDataView = function (buffer, byteOffset, byteLength, littleEndian) {
  this._buffer = buffer;
  
  // Handle Type Errors
  if (!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) &&
  !(typeof buffer === 'string')) {
  throw new TypeError("Type error");
  }
  
  // Check parameters and existing functionnalities
  this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
  this._isDataView = compatibility.DataView && this._isArrayBuffer;
  
  // Default Values
  this._littleEndian = littleEndian === undefined ? true : littleEndian;
  
  var bufferLength = this._isArrayBuffer ? buffer.byteLength : buffer.length;
  if (byteOffset == undefined) {
  byteOffset = 0;
  }
  
  if (byteLength == undefined) {
  byteLength = bufferLength - byteOffset;
  }
  
  if (!this._isDataView) {
  // Do additional checks to simulate DataView
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (typeof byteLength !== 'number') {
  throw new TypeError("Type error");
  }
  if (typeof byteOffset < 0) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  if (typeof byteLength < 0) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  }
  
  // Instanciate
  if (this._isDataView) {
  this._view = new DataView(buffer, byteOffset, byteLength);
  this._start = 0;
  }
  this._start = byteOffset;
  if (byteOffset >= bufferLength) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  this._offset = 0;
  this.length = byteLength;
  };
  
  jDataView.createBuffer = function () {
  if (typeof ArrayBuffer !== 'undefined') {
  var buffer = new ArrayBuffer(arguments.length);
  var view = new Int8Array(buffer);
  for (var i = 0; i < arguments.length; ++i) {
  view[i] = arguments[i];
  }
  return buffer;
  }
  
  return String.fromCharCode.apply(null, arguments);
  };
  
  jDataView.prototype = {
  
  // Helpers
  
  getString: function (length, byteOffset) {
  var value;
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (length < 0 || byteOffset + length > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  if (this._isArrayBuffer) {
  // Use Int8Array and String.fromCharCode to extract a string
  var int8array = new Int8Array(this._buffer, this._start + byteOffset, length);
  var stringarray = [];
  for (var i = 0; i < length; ++i) {
  stringarray[i] = int8array[i];
  }
  value = String.fromCharCode.apply(null, stringarray);
  } else {
  value = this._buffer.substr(this._start + byteOffset, length);
  }
  
  this._offset = byteOffset + length;
  return value;
  },
  
  getChar: function (byteOffset) {
  var value, size = 1;
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  if (this._isArrayBuffer) {
  // Use Int8Array and String.fromCharCode to extract a string
  value = String.fromCharCode(this.getUint8(byteOffset));
  } else {
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset + size > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  value = this._buffer.charAt(this._start + byteOffset);
  this._offset = byteOffset + size;
  }
  
  return value;
  },
  
  tell: function () {
  return this._offset;
  },
  
  seek: function (byteOffset) {
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset < 0 || byteOffset > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  
  this._offset = byteOffset;
  },
  
  // Compatibility functions on a String Buffer
  
  _endianness: function (offset, pos, max, littleEndian) {
  return offset + (littleEndian ? max - pos - 1 : pos);
  },
  
  _getFloat64: function (offset, littleEndian) {
  var b0 = this._getUint8(this._endianness(offset, 0, 8, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 1, 8, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 2, 8, littleEndian)),
  b3 = this._getUint8(this._endianness(offset, 3, 8, littleEndian)),
  b4 = this._getUint8(this._endianness(offset, 4, 8, littleEndian)),
  b5 = this._getUint8(this._endianness(offset, 5, 8, littleEndian)),
  b6 = this._getUint8(this._endianness(offset, 6, 8, littleEndian)),
  b7 = this._getUint8(this._endianness(offset, 7, 8, littleEndian)),
  
  sign = 1 - (2 * (b0 >> 7)),
  exponent = ((((b0 << 1) & 0xff) << 3) | (b1 >> 4)) - (Math.pow(2, 10) - 1),
  
  // Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
  mantissa = ((b1 & 0x0f) * Math.pow(2, 48)) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32))
  + (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;
  
  if (mantissa == 0 && exponent == -(Math.pow(2, 10) - 1)) {
  return 0.0;
  }
  
  if (exponent == -1023) { // Denormalized
  return sign * mantissa * Math.pow(2, -1022 - 52);
  }
  
  return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
  },
  
  _getFloat32: function (offset, littleEndian) {
  var b0 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
  b3 = this._getUint8(this._endianness(offset, 3, 4, littleEndian)),
  
  sign = 1 - (2 * (b0 >> 7)),
  exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
  mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;
  
  if (mantissa == 0 && exponent == -127) {
  return 0.0;
  }
  
  if (exponent == -127) { // Denormalized
  return sign * mantissa * Math.pow(2, -126 - 23);
  }
  
  return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
  },
  
  _getInt32: function (offset, littleEndian) {
  var b = this._getUint32(offset, littleEndian);
  return b > Math.pow(2, 31) - 1 ? b - Math.pow(2, 32) : b;
  },
  
  _getUint32: function (offset, littleEndian) {
  var b3 = this._getUint8(this._endianness(offset, 0, 4, littleEndian)),
  b2 = this._getUint8(this._endianness(offset, 1, 4, littleEndian)),
  b1 = this._getUint8(this._endianness(offset, 2, 4, littleEndian)),
  b0 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
  
  return (b3 * Math.pow(2, 24)) + (b2 << 16) + (b1 << 8) + b0;
  },
  
  _getInt16: function (offset, littleEndian) {
  var b = this._getUint16(offset, littleEndian);
  return b > Math.pow(2, 15) - 1 ? b - Math.pow(2, 16) : b;
  },
  
  _getUint16: function (offset, littleEndian) {
  var b1 = this._getUint8(this._endianness(offset, 0, 2, littleEndian)),
  b0 = this._getUint8(this._endianness(offset, 1, 2, littleEndian));
  
  return (b1 << 8) + b0;
  },
  
  _getInt8: function (offset) {
  var b = this._getUint8(offset);
  return b > Math.pow(2, 7) - 1 ? b - Math.pow(2, 8) : b;
  },
  
  _getUint8: function (offset) {
  if (this._isArrayBuffer) {
  return new Uint8Array(this._buffer, this._start + offset, 1)[0];
  } else {
  return this._buffer.charCodeAt(this._start + offset) & 0xff;
  }
  }
  };
  
  // Create wrappers
  
  var dataTypes = {
  'Int8': 1,
  'Int16': 2,
  'Int32': 4,
  'Uint8': 1,
  'Uint16': 2,
  'Uint32': 4,
  'Float32': 4,
  'Float64': 8
  };
  
  for (var type in dataTypes) {
  // Bind the variable type
  (function (type) {
  var size = dataTypes[type];
  
  // Create the function
  jDataView.prototype['get' + type] = 
  function (byteOffset, littleEndian) {
  var value;
  
  // Handle the lack of endianness
  if (littleEndian == undefined) {
  littleEndian = this._littleEndian;
  }
  
  // Handle the lack of byteOffset
  if (byteOffset === undefined) {
  byteOffset = this._offset;
  }
  
  // Dispatch on the good method
  if (this._isDataView) {
  // DataView: we use the direct method
  value = this._view['get' + type](byteOffset, littleEndian);
  }
  // ArrayBuffer: we use a typed array of size 1 if the alignment is good
  // ArrayBuffer does not support endianess flag (for size > 1)
  else if (this._isArrayBuffer && byteOffset % size == 0 && (size == 1 || littleEndian)) {
  value = new self[type + 'Array'](this._buffer, byteOffset, 1)[0];
  }
  else {
  // Error Checking
  if (typeof byteOffset !== 'number') {
  throw new TypeError("Type error");
  }
  if (byteOffset + size > this.length) {
  throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
  }
  value = this['_get' + type](this._start + byteOffset, littleEndian);
  }
  
  // Move the internal offset forward
  this._offset = byteOffset + size;
  
  return value;
  };
  })(type);
  }`*/
  compatibility = {
    ArrayBuffer: typeof ArrayBuffer !== "undefined",
    DataView: typeof DataView !== "undefined" && "getFloat64" in DataView.prototype
  };
  jDataView = function(buffer, byteOffset, byteLength, littleEndian) {
    var bufferLength;
    this._buffer = buffer;
    if (!(compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) && (typeof buffer !== "string")) {
      throw new TypeError("Type error");
    }
    this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
    this._isDataView = compatibility.DataView && this._isArrayBuffer;
    this._littleEndian = (littleEndian === undefined ? true : littleEndian);
    bufferLength = (this._isArrayBuffer ? buffer.byteLength : buffer.length);
    if (byteOffset === undefined) {
      byteOffset = 0;
    }
    if (byteLength === undefined) {
      byteLength = bufferLength - byteOffset;
    }
    if (!this._isDataView) {
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (typeof byteLength !== "number") {
        throw new TypeError("Type error");
      }
      if (typeof byteOffset < 0) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      if (typeof byteLength < 0) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
    }
    if (this._isDataView) {
      this._view = new DataView(buffer, byteOffset, byteLength);
      this._start = 0;
    }
    this._start = byteOffset;
    if (byteOffset >= bufferLength) {
      throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
    }
    this._offset = 0;
    return this.length = byteLength;
  };
  jDataView.createBuffer = function() {
    var buffer, i, view;
    if (typeof ArrayBuffer !== "undefined") {
      buffer = new ArrayBuffer(arguments.length);
      view = new Int8Array(buffer);
      i = 0;
      while (i < arguments.length) {
        view[i] = arguments[i];
        ++i;
      }
      return buffer;
    }
    return String.fromCharCode.apply(null, arguments);
  };
  jDataView.prototype = {
    getString: function(length, byteOffset) {
      var i, int8array, stringarray, value;
      value = void 0;
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (length < 0 || byteOffset + length > this.length) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      if (this._isArrayBuffer) {
        int8array = new Int8Array(this._buffer, this._start + byteOffset, length);
        stringarray = [];
        i = 0;
        while (i < length) {
          stringarray[i] = int8array[i];
          ++i;
        }
        value = String.fromCharCode.apply(null, stringarray);
      } else {
        value = this._buffer.substr(this._start + byteOffset, length);
      }
      this._offset = byteOffset + length;
      return value;
    },
    getChar: function(byteOffset) {
      var size, value;
      value = void 0;
      size = 1;
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (this._isArrayBuffer) {
        value = String.fromCharCode(this.getUint8(byteOffset));
      } else {
        if (typeof byteOffset !== "number") {
          throw new TypeError("Type error");
        }
        if (byteOffset + size > this.length) {
          throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
        }
        value = this._buffer.charAt(this._start + byteOffset);
        this._offset = byteOffset + size;
      }
      return value;
    },
    tell: function() {
      return this._offset;
    },
    seek: function(byteOffset) {
      if (typeof byteOffset !== "number") {
        throw new TypeError("Type error");
      }
      if (byteOffset < 0 || byteOffset > this.length) {
        throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
      }
      return this._offset = byteOffset;
    },
    _endianness: function(offset, pos, max, littleEndian) {
      return offset + (littleEndian ? max - pos - 1 : pos);
    },
    _getFloat64: function(offset, littleEndian) {
      var b0, b1, b2, b3, b4, b5, b6, b7, exponent, mantissa, sign;
      b0 = this._getUint8(this._endianness(offset, 0, 8, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 1, 8, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 2, 8, littleEndian));
      b3 = this._getUint8(this._endianness(offset, 3, 8, littleEndian));
      b4 = this._getUint8(this._endianness(offset, 4, 8, littleEndian));
      b5 = this._getUint8(this._endianness(offset, 5, 8, littleEndian));
      b6 = this._getUint8(this._endianness(offset, 6, 8, littleEndian));
      b7 = this._getUint8(this._endianness(offset, 7, 8, littleEndian));
      sign = 1 - (2 * (b0 >> 7));
      exponent = (((b0 << 1) & 0xff) << 3) | (b1 >> 4) - (Math.pow(2, 10) - 1);
      mantissa = (b1 & 0x0f) * Math.pow(2, 48) + (b2 * Math.pow(2, 40)) + (b3 * Math.pow(2, 32)) + (b4 * Math.pow(2, 24)) + (b5 * Math.pow(2, 16)) + (b6 * Math.pow(2, 8)) + b7;
      if (mantissa === 0 && exponent === -(Math.pow(2, 10) - 1)) {
        return 0.0;
      }
      if (exponent === -1023) {
        return sign * mantissa * Math.pow(2, -1022 - 52);
      }
      return sign * (1 + mantissa * Math.pow(2, -52)) * Math.pow(2, exponent);
    },
    _getFloat32: function(offset, littleEndian) {
      var b0, b1, b2, b3, exponent, mantissa, sign;
      b0 = this._getUint8(this._endianness(offset, 0, 4, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 1, 4, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 2, 4, littleEndian));
      b3 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
      sign = 1 - (2 * (b0 >> 7));
      exponent = ((b0 << 1) & 0xff) | (b1 >> 7) - 127;
      mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;
      if (mantissa === 0 && exponent === -127) {
        return 0.0;
      }
      if (exponent === -127) {
        return sign * mantissa * Math.pow(2, -126 - 23);
      }
      return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
    },
    _getInt32: function(offset, littleEndian) {
      var b;
      b = this._getUint32(offset, littleEndian);
      if (b > Math.pow(2, 31) - 1) {
        return b - Math.pow(2, 32);
      } else {
        return b;
      }
    },
    _getUint32: function(offset, littleEndian) {
      var b0, b1, b2, b3;
      b3 = this._getUint8(this._endianness(offset, 0, 4, littleEndian));
      b2 = this._getUint8(this._endianness(offset, 1, 4, littleEndian));
      b1 = this._getUint8(this._endianness(offset, 2, 4, littleEndian));
      b0 = this._getUint8(this._endianness(offset, 3, 4, littleEndian));
      return (b3 * Math.pow(2, 24)) + (b2 << 16) + (b1 << 8) + b0;
    },
    _getInt16: function(offset, littleEndian) {
      var b;
      b = this._getUint16(offset, littleEndian);
      if (b > Math.pow(2, 15) - 1) {
        return b - Math.pow(2, 16);
      } else {
        return b;
      }
    },
    _getUint16: function(offset, littleEndian) {
      var b0, b1;
      b1 = this._getUint8(this._endianness(offset, 0, 2, littleEndian));
      b0 = this._getUint8(this._endianness(offset, 1, 2, littleEndian));
      return (b1 << 8) + b0;
    },
    _getInt8: function(offset) {
      var b;
      b = this._getUint8(offset);
      if (b > Math.pow(2, 7) - 1) {
        return b - Math.pow(2, 8);
      } else {
        return b;
      }
    },
    _getUint8: function(offset) {
      if (this._isArrayBuffer) {
        return new Uint8Array(this._buffer, this._start + offset, 1)[0];
      } else {
        return this._buffer.charCodeAt(this._start + offset) & 0xff;
      }
    }
  };
  dataTypes = {
    Int8: 1,
    Int16: 2,
    Int32: 4,
    Uint8: 1,
    Uint16: 2,
    Uint32: 4,
    Float32: 4,
    Float64: 8
  };
  _fn = function(type) {
    var size;
    size = dataTypes[type];
    return jDataView.prototype["get" + type] = function(byteOffset, littleEndian) {
      var value;
      value = void 0;
      if (littleEndian === undefined) {
        littleEndian = this._littleEndian;
      }
      if (byteOffset === undefined) {
        byteOffset = this._offset;
      }
      if (this._isDataView) {
        value = this._view["get" + type](byteOffset, littleEndian);
      } else if (this._isArrayBuffer && byteOffset % size === 0 && (size === 1 || littleEndian)) {
        value = new self[type + "Array"](this._buffer, byteOffset, 1)[0];
      } else {
        if (typeof byteOffset !== "number") {
          throw new TypeError("Type error");
        }
        if (byteOffset + size > this.length) {
          throw new Error("INDEX_SIZE_ERR: DOM Exception 1");
        }
        value = this["_get" + type](this._start + byteOffset, littleEndian);
      }
      this._offset = byteOffset + size;
      return value;
    };
  };
  for (type in dataTypes) {
    _fn(type);
  }
}).call(this);
