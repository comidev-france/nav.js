# nav.js

Javascript History API superset.
Detect browser navigation event, even forward / backward buttons.

requires [hook.js](https://github.com/comidev-france/hook.js/blob/main/hook.js)

usage :


```
window.addEventListener('nav::tick', function(e) {
    console.log("nav::location=" + document.location);
    log_nav_position(e.detail.nav_position, e.detail.nav_history, e.detail.nav_direction);
})
```

```
nav::init 
nav::location=http://localhost:5001/admin/ 
nav::position=1/1 direction=initial page 
---------- 
nav::pushState(...) 
nav::location=http://localhost:5001/admin/groups
nav::position=2/2 direction=forward 
----------
nav::onPopState
nav::location=http://localhost:5001/admin/
nav::position=1/2 direction=backward 
nav::----------
```

