const signUpForm = document.querySelector("#signupForm");
const emailFeedback = document.querySelector("#emailFeedback");
const emailInput = signUpForm.elements.email;

async function  check(email){
  
   if (!emailInput.checkValidity()) {
        emailAvailable = false;

        emailInput.classList.remove("is-valid", "is-invalid");
        emailFeedback.classList.remove("text-success", "text-danger");
        emailFeedback.textContent = "";
        return;
    }
    try{
      const res=await axios.get(`/email-availability`,{
         params: 
          {
            email: email.trim()
          }
      });
          emailAvailable=res.data.available
       if (emailAvailable) {
          emailInput.classList.remove("is-invalid");
          emailInput.classList.add("is-valid");

          emailFeedback.classList.remove("text-danger");
          emailFeedback.classList.add("text-success");
          emailFeedback.textContent = "✔ Email is available";
        } 
        else {
          emailInput.classList.remove("is-valid");
          emailInput.classList.add("is-invalid");

          emailFeedback.classList.remove("text-success");
          emailFeedback.classList.add("text-danger");
          emailFeedback.textContent = "✘ email already registered";
        }
    }catch(err){
      emailAvailable=false;
      console.log(err);
    }
  
}

let emailAvailable=false;
if (signUpForm) {
  let timer;  
  signUpForm.elements.email.addEventListener("input",async(event)=>{
      emailAvailable=false;
      clearTimeout(timer);
      //see if you want to pass parameter 
      //and also want to use setTimeout 
      //it is done like this ()=>{now pass that fxn with parameter}
      //if you directly used parameter fxn it would be called imediately and only once
      timer=setTimeout(()=>{check(event.target.value);},400);
      
    });
}


// ================================
// Bootstrap Form Validation
// Prevents form submission if validation fails
// ================================

(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if(form===signUpForm){
         if (!form.checkValidity() || !emailAvailable) {
        event.preventDefault()
        event.stopPropagation()
      }
      }else{
        if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      }
      

      form.classList.add('was-validated')
    }, false)
  })
})()





// ================================
// SweetAlert2 Flash Messages
// Shows success or error popup
// based on flash messages sent by Express
// ================================


if (window.flashSuccess) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: window.flashSuccess,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

if (window.flashError) {
  const timer = window.flashError.length > 50 ? 2800 : 2000;  
  Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: window.flashError,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true
    });
}
if (window.flashWarning) {
  const timer = window.flashWarning.length > 50 ? 2800 : 2000;  
  Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: window.flashWarning,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true
    });
}

// ================================
// SweetAlert2 Delete Confirmation
// Shows confirmation before deleting
// a listing or review
// ================================

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger"
  },
  buttonsStyling: false
});

const deleteForms=document.querySelectorAll(".delete-form");

  deleteForms.forEach((form) => {
  
  form.addEventListener("submit",(event)=>{
    event.preventDefault();
    swalWithBootstrapButtons.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, delete it!",
  cancelButtonText: "No, cancel!",
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed){
    form.submit();
  } 
  else if (result.dismiss === Swal.DismissReason.cancel){
  swalWithBootstrapButtons.fire({
    title: "Cancelled",
    text: "Nothing was deleted.",
    icon: "error"
  });
  }
});

  })

});

//Modals



document.addEventListener("DOMContentLoaded", () => {

    const modalContent = document.querySelector(".modal-content");

    const signupBtn = document.getElementById("showSignup");
    const loginBtn = document.getElementById("showLogin");

    signupBtn.addEventListener("click", () => {
    modalContent.classList.add("active");
    });

    loginBtn.addEventListener("click", () => {
      modalContent.classList.remove("active");
    });

});

//login modal activation 
if (window.openLoginModal) {
   document.addEventListener("DOMContentLoaded",  () => {
            const modalElement = document.getElementById("signupModal");
            document.querySelector(".modal-content").classList.add("active");
            const modal = new bootstrap.Modal(modalElement);
             
            modal.show();
            
            modalElement.addEventListener("hidden.bs.modal", async () => {
                await axios.post("/",{
                    closed:true
                })
            });
            });
}



   






