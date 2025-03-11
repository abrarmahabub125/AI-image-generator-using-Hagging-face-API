const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn button");
const promptInput = document.querySelector(".textarea");
const modelSelect = document.querySelector("#model-select");
const imageCount = document.querySelector("#count-select");
const ratioSelect = document.querySelector("#ratio-select");
const generateBtn= document.querySelector("#generate-btn");
const galleryGrid = document.querySelector(".image-wraper");

//API token
const API_TOKEN = "Use_Your_Own_Token";

//insert random para for image generator 
const randomPrompt = [
    "A magical forest with glowing blue trees, floating islands in the sky, and a crystal-clear river reflecting the stars. A mystical deer with golden antlers stands near a waterfall.",
    "A futuristic neon-lit city at night, with flying cars, holographic billboards, and people wearing augmented reality visors. A lone hacker in a hoodie is sitting in a high-tech cafe.",
    "An astronaut standing on an alien planet with two suns, surrounded by towering rock formations and glowing alien plants. In the sky, a massive ringed planet is visible.",
    "A group of armored knights charging into battle on horseback, wielding swords and shields. A castle stands in the background with banners flying in the wind.",
    "An ancient sunken city with coral-covered ruins, glowing jellyfish floating around, and a giant sea turtle carrying a treasure chest on its back.",
    "A Victorian-era scientist in a mechanical workshop, working on a giant steam-powered robot with gears, pipes, and glowing tubes.",
    "A fire-breathing dragon with red and black scales perched on a rocky cliff, its wings spread wide as it roars against a stormy sky.",
    "A deserted city overgrown with plants, abandoned cars covered in moss, and a lone survivor wearing a gas mask walking through the ruins.",
    "A grand Mayan temple in the jungle, with golden statues, hidden treasure, and explorers uncovering secrets inside a dark chamber.",
    "A futuristic battlefield where humanoid robots with glowing blue eyes are fighting against human soldiers with advanced weapons in a dystopian setting."
];

//handel random prompt
promptBtn.addEventListener("click", (e) =>{
    e.preventDefault();
    const randomIdx = Math.floor(Math.random() * randomPrompt.length);
    promptInput.value = randomPrompt[randomIdx];
    promptInput.focus();
});

//customs image dimensions
const generateImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map (Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);
    
    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    // Ensure dimensions are multiples of 16 (AI model requirements)
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 15;

    return { width: calculatedWidth, height: calculatedHeight };
    
};

const updateImageCard = (imageIdx, imageURL) =>{
    const imageCard = document.getElementById(`image-card-${imageIdx}`);
    if(!imageCard) return;
    
    imageCard.classList.remove("loading");
    imageCard.innerHTML = `
                        <img src="${imageURL}" class="image-result" id="img-result">
                        <div class="image-overley">
                            <a href="${imageURL}" class="download" download="${Date.now()}.png"><i class="fa-solid fa-arrow-down"></i></button>
                        </div>
    `
};

//Generate API response based on user inputs
const generateRespons = async (selectModel, countImage, aspectRatio, promptText) => {
    
    const API_URL = `https://api-inference.huggingface.co/models/${selectModel}`;
    const {width,height} = generateImageDimensions(aspectRatio);
    generateBtn.setAttribute("disabled", "true")
    const imagePromises = Array.from({length: countImage}, async(_,i) =>{
        
        try {
            const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptText,
                parameters: { width, height },
                options: { wait_for_model: true, user_cache: false },
            }),
        });
        if (!response.ok) throw new Error((await response.json())?.error)
            //Convert respons to an image URL
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
            
        } catch (error) {
            console.log(error)
            const imageCard = document.getElementById(`image-card-${i}`);
            imageCard.classList.replace("loading", "error")
            document.querySelector(`.status-text-${i}`).textContent ="Generation failed!"
        }
        
    });
    
    await Promise.allSettled(imagePromises);
    generateBtn.removeAttribute("disabled");
};

//insert image card in galleryGrid
function createImageCard(selectModel, countImage, aspectRatio, promptText){
    galleryGrid.innerHTML = "";
    for (let i = 0; i < countImage; i++) {
        galleryGrid.innerHTML +=`<div class="image-card loading" id="image-card-${i}" style="aspect-ratio: ${aspectRatio}">
                                    <div class="status-container">
                                        <div class="spinner"></div>
                                        <i class="fa-solid fa-triangle-exclamation"></i>
                                        <p class="status-text-${i} status-text">Generating...</p>
                                    </div>
                                    <img src="" class="image-result" id="img-result">
                                </div>`
      }
    generateRespons(selectModel, countImage, aspectRatio, promptText)
};

//handel form submission to get selected value
function handelFormSubmit(e) {
    e.preventDefault();
    const selectModel = modelSelect.value;
    const countImage = parseInt(imageCount.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value;

    createImageCard(selectModel, countImage, aspectRatio, promptText)
};

//handel dark mood and light mood
let mood = "dark"; 
const handelTheme = () =>{
    let icon = document.querySelector("#theme") 
    if (mood == "dark") {
        document.body.classList.toggle("dark-theme");
        icon.classList.replace("fa-sun", "fa-moon")
        mood = "light"
    } else {
        document.body.classList.remove("dark-theme");
        icon.classList.replace("fa-moon", "fa-sun")
        mood = "dark"
    }
};

//Handel event form submission 
generateBtn.addEventListener('click', handelFormSubmit);

// handel dark theme and light theme
themeToggle.addEventListener("click", handelTheme);






