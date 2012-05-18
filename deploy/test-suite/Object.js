var testObj = {
    access_flags : 33,
    attributes : new Array(),
    attributes_count : 0,
    constant_pool : {
        2 : new CONSTANT_integer(5), // for ldc / 18
        18 : this,
        258 : new CONSTANT_integer(5),
        259 : new CONSTANT_long(1)
    },
    constant_pool_count : 0,
    dependancies : Array[8],
    fields : [],
    fields_count : 0,
    interfaces : [],
    interfaces_count : 0,
    magic_number : 3405691582,
    major_version : 49,
    method_count : 14,
    methods : { 
        '<init>()V' : {
            access_flags : 1,
            args : [],
            attribute_count : 1,
            attributes : {
                'Code' : {
                    'code' : [
                        ]
                }
            }
        }
    },
    methods_count : 0,
    minor_version : 0,
    real_name : "java/lang/Object",
    super_class: 0,
    this_class: 18
};                
