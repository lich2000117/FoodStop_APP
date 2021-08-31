function checkPass () {
  $("#btnSubmit").click(function () {
      var password = $("#password").val();
      var confirmPassword = $("#confirm_password").val();
      if (password != confirmPassword) {
          alert("Passwords do not match.");
          return false;
      }
      return true;
  });
};

var passwordO = document.getElementById("password");
var passwordC = document.getElementById("confirm_password");

// exist a-z, A-Z, 0-9, special, 8+ char
var strongPassword = new RegExp('(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})')

function passwordCheck() {
  var submit = document.getElementById("btnSubmit");
  var pswIns = document.getElementById("passwordInstruction");
  var pswCor = document.getElementById("passwordCorrect");
  var pswConIns = document.getElementById("passwordConInstruction");
  var pswConCor = document.getElementById("passwordConCorrect");
  var password = $("#password").val();
  var confirmPassword = $("#confirm_password").val();
  var flag;
  if(strongPassword.test($("#password").val())){
    // password strong enough
    pswIns.hidden = true;
    pswCor.hidden = false;
    flag = true;
  } else {
    pswIns.hidden = false;
    pswCor.hidden = true;
    flag = false;
  }

  if(password == confirmPassword){
    // password == confirm_password
    pswConIns.hidden = true;
    pswConCor.hidden = false;
  } else {
    pswConIns.hidden = false;
    pswConCor.hidden = true;
    flag = false;
  }

}



