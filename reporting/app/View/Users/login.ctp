<?php echo $this->Session->flash(); ?>
<div class="grid_12 prefix_4" style="width: 270px;">

<form action="/users/login" id="UserLoginForm" method="post" accept-charset="utf-8" class="well">
    <h1>Login</h1></br>

    <input name = "data[User][username]"type="text" placeholder="Username"></br>

    <input name = "data[User][password]"type="password" placeholder="Password"></br>

    <button nametype="submit" class="btn btn-primary">Sign in</button>

</form>
</div>