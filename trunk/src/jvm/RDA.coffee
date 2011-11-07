class this.RDA 
  method_area : {}
  heap : {
    permgen : {}
    oldgen : {}
    younggen : {}
  }
  threads : {}
  
#class Thread
#  pc : 0
#  jvm_stack : {
#    frames : {
#      1 : new Frame()
#    }
#  }

class Frame 
  op_stack = new Array()
  rcp_reference : {}
  local_vars : {}

