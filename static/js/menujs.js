
function addNum(index, price)
{
    var quan = parseInt(document.getElementsByName("quantity")[index].innerHTML);
    document.getElementsByName("quantity")[index].innerHTML = quan+1; 
    var originTotal = parseInt(document.getElementById("checkoutAmount").innerHTML.replace(/[A-Za-z$-]/g, ""))
    document.getElementById("checkoutAmount").innerHTML = "$" + (originTotal + parseInt(price)) + " Check Out"

    //Disable Button for a period of time
    var buttons = document.getElementsByName("submitButton");
    
    for (var i=0; i<buttons.length;i++){
        buttons[i].disabled = true;
        document.getElementById("checkoutAmount").disabled = true;
        document.getElementById("loader").style.display = "block";
        setTimeout(function(){
            var buttons = document.getElementsByName("submitButton");
            for (var c=0; c<buttons.length;c++){
                buttons[c].disabled = false;
            }
            document.getElementById("checkoutAmount").disabled = false;

            // Enable Loading Animation 
            document.getElementById("loader").style.display = "none";
        }, 800);
    }
    return true;
}

function removeNum(index, price)
{
    var quan = parseInt(document.getElementsByName("quantity")[index].innerHTML);
    if (quan<=0){
        return true;
    }
    document.getElementsByName("quantity")[index].innerHTML = quan-1; 
    var originTotal = parseInt(document.getElementById("checkoutAmount").innerHTML.replace(/[A-Za-z$-]/g, ""))
    document.getElementById("checkoutAmount").innerHTML = "$" + (originTotal - parseInt(price)) + " Check Out";

    //Disable Button for a period of time
    var buttons = document.getElementsByName("submitButton");
    for (var i=0; i<buttons.length;i++){
        buttons[i].disabled = true;
        document.getElementById("checkoutAmount").disabled = true;
        document.getElementById("loader").style.display = "block";
        setTimeout(function(){
            var buttons = document.getElementsByName("submitButton");
            for (var c=0; c<buttons.length;c++){
                buttons[c].disabled = false;
            }
            document.getElementById("checkoutAmount").disabled = false;

            // Enable Loading Animation 
            document.getElementById("loader").style.display = "none";
        }, 800);
    }
    return true;
}

