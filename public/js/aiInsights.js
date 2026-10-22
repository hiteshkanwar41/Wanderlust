const scrollContainer = document.querySelector(".listingscrollbar");
const nextBtn = document.querySelector(".scroll-btn");

if(nextBtn){
nextBtn.addEventListener("click", () => {
    scrollContainer.scrollBy({
        left: 320,
        behavior: "smooth"
    });
});
}

generateBtn=document.querySelector("#generate-btn");
generateBtn.addEventListener("click",async ()=>{
    const selected = document.querySelector('input[name="listing"]:checked');
    
    if (selected) {
        const listingId = selected.id;
        result=await axios.post("/api/analytics/aiInsights",{
        listingId: listingId
    })
    }
    
    const currPrice = document.querySelector('#currPrice');
    const suggestedPrice = document.querySelector('#suggestedPrice');
    animateKPI(currPrice, 0, result.data.currPrice,"$");
    animateKPI(suggestedPrice, 0, result.data.predictedPrice,"$");
    const highResult = document.querySelector('.high-result');
    const lowResult = document.querySelector('.low-result');
    
    if(result.data.predictedOccupancy){
        highResult.classList.add("active");
        lowResult.classList.remove("active");
    }else{
        lowResult.classList.add("active");
        highResult.classList.remove("active");
    }

    
})