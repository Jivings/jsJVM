class this.GC

    grey : 1 # root objects
    white : 0 # others
    black : 3 # reachable
    running : false
    missed : 0

    constructor : (@method_area, @heap, @threads) ->
      setInterval(()=>
         @collect()
      , 1000)

    run : () ->
        @mark()
        @reclaim()
        @promote()
        yes

    mark : () ->
        while (next = @getnextgrey()) isnt null
            for prop of next
                if next[prop] instanceof JVM_Reference
                    if next[prop].pointer isnt 0 # not null
                        @heap.younggen[next[prop].pointer].colour = @grey
            next.colour = @black
        yes

    reclaim : () ->
        for index of @heap.younggen
            item = @heap.younggen[index]
            if item.colour is @white
                delete @heap.younggen[index]
        yes
    
    promote : () ->
        yes

    collect : () ->
        if @running 
            @missed++
            if @missed > 3 then throw "outofmemoryerror"
            return
        @missed = 0
        for cls of @method_area
            fields = @method_area[cls].fields
            for field of fields
                ref = fields[field]
                if ref.pointer and ref.pointer isnt 0
                    try
                        @heap.younggen[ref.pointer].colour = @grey
                    catch e
                        # strange bug, sometimes it appears to not see an
                        # object here, even though it does exist. This is a
                        # dumb hack
                        console.log("Missing object bug")

        @threadcount = @threads.length
        @responses = 0
        message = {
            'action' : 'GCreport'
        }
        for thread in @threads
            thread.postMessage(message)

        yes

    add : (rootobjects) ->
        for ref in rootobjects
            @heap.younggen[ref.pointer].colour = @grey

        if ++@responses is @threadcount
            @run()
        yes
    
    getnextgrey : () ->
        nextref = 1
        grey = null
        len = Object.keys(@heap.younggen).length
        while nextref < len
            grey = @heap.younggen[nextref++]
            if grey is undefined then continue
            if grey.colour is @grey
                return grey
        return null
