'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaintBrush, FaDownload } from 'react-icons/fa';

const HomePage: React.FC = () => {
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [firstGenImg, setFirstGenImg] = useState<string>('https://placekitten.com/600/400');
    const [secondGenImg, setSecondGenImg] = useState<string>('https://placekitten.com/601/400');

    const [imagePrompts, setImagePrompts] = useState<{ url: string; description: string }[]>([
        {
            url: "https://image.pollinations.ai/prompt/sunset%20over%20mountains?nologo=true",
            description: "A serene sunset over majestic mountains"
        },
        {
            url: "https://image.pollinations.ai/prompt/futuristic%20cityscape%20at%20night?nologo=true",
            description: "A dazzling futuristic cityscape at night"
        },
    ]);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const generateImages = () => {
      const staticImageArray: { url: string; description: string }[] = [
        {
            url: "https://image.pollinations.ai/prompt/lion%20in%20a%20jungle?nologo=true",
            description: "A regal lion resting in a lush jungle",
        },
        {
            url: "https://image.pollinations.ai/prompt/astronaut%20exploring%20a%20new%20planet?nologo=true",
            description: "An astronaut's journey on a distant planet",
        },
        {
            url: "https://image.pollinations.ai/prompt/abstract%20painting%20in%20vibrant%20colors?nologo=true",
            description: "An abstract burst of vibrant colors",
        },
        {
            url: "https://image.pollinations.ai/prompt/cute%20puppy%20playing%20in%20a%20park?nologo=true",
            description: "An adorable puppy frolicking in the park",
        },
        {
            url: "https://image.pollinations.ai/prompt/mystical%20forest%20path?nologo=true",
            description: "A mystical path winding through an ancient forest",
        },
        {
            url: "https://image.pollinations.ai/prompt/a%20delicious%20chocolate%20cake?nologo=true",
            description: "A tempting view of a delicious chocolate cake",
        },
        {
            url: "https://image.pollinations.ai/prompt/ancient%20egyptian%20pyramid?nologo=true",
            description: "An awe-inspiring ancient Egyptian pyramid",
        },
        {
            url: "https://image.pollinations.ai/prompt/starry%20night%20with%20a%20milky%20way?nologo=true",
            description: "The breathtaking Milky Way over a starry night",
        },
        {
            url: "https://image.pollinations.ai/prompt/red%20vintage%20car?nologo=true",
            description: "A sleek vintage car from the past",
        },
        {
            url: "https://image.pollinations.ai/prompt/colorful%20tropical%20fish?nologo=true",
            description: "A mesmerizing view of colorful tropical fish",
        },
        {
            url: "https://image.pollinations.ai/prompt/majestic%20waterfall%20in%20a%20forest?nologo=true",
            description: "A majestic waterfall in a peaceful forest",
        },
        {
            url: "https://image.pollinations.ai/prompt/hot%20air%20balloons%20over%20a%20landscape?nologo=true",
            description: "Hot air balloons gracefully float over a beautiful landscape",
        },
        {
          url: "https://image.pollinations.ai/prompt/sailboat%20on%20the%20ocean?nologo=true",
          description: "A sailboat glides peacefully on the ocean"
        },
       {
         url: "https://image.pollinations.ai/prompt/steampunk%20airship%20in%20the%20sky?nologo=true",
         description: "A fantastic steampunk airship graces the sky",
       },
        {
            url: "https://image.pollinations.ai/prompt/snowy%20mountain%20peak?nologo=true",
          description: "A snowy mountain peak catches the eye"
      },
      {
        url: "https://image.pollinations.ai/prompt/tropical%20beach%20with%20palm%20trees?nologo=true",
            description: "A tropical beach awaits with gentle palm trees",
      },
      {
         url: "https://image.pollinations.ai/prompt/glowing%20neon%20city%20at%20night?nologo=true",
           description: "A city lit up with vibrant neon colors",
     },
     {
       url: "https://image.pollinations.ai/prompt/vintage%20train%20on%20railway?nologo=true",
        description: "A vintage train travels on the railway"
       },
      {
        url: "https://image.pollinations.ai/prompt/lavender%20field%20at%20sunrise?nologo=true",
          description: "A breathtaking lavender field at sunrise",
      },
        {
            url: "https://image.pollinations.ai/prompt/surreal%20clockwork%20landscape?nologo=true",
          description: "An extraordinary surreal clockwork landscape",
        },
         {
               url: "https://image.pollinations.ai/prompt/majestic%20elephant%20in%20the%20savannah?nologo=true",
           description: "A majestic elephant in its natural savannah habitat",
         },
      {
         url: "https://image.pollinations.ai/prompt/crystal%20cave%20with%20glowing%20crystals?nologo=true",
          description: "A mysterious crystal cave full of glowing gems"
    },
      {
      url: "https://image.pollinations.ai/prompt/bonsai%20tree%20in%20a%20tranquil%20garden?nologo=true",
      description: "A delicate bonsai tree in a peaceful garden",
       },
      {
      url: "https://image.pollinations.ai/prompt/lighthouse%20at%20sunset?nologo=true",
        description: "A beautiful lighthouse watches the sunset",
  },
      {
        url: "https://image.pollinations.ai/prompt/corgi%20in%20a%20cosmic%20spacesuit?nologo=true",
          description: "An unusual corgi in a spacesuit venturing to the stars",
  },
     {
     url: "https://image.pollinations.ai/prompt/cozy%20cabin%20in%20the%20mountains?nologo=true",
      description: "A cozy mountain cabin for peaceful getaway",
       },
      {
        url: "https://image.pollinations.ai/prompt/terrarium%20with%20miniature%20landscape?nologo=true",
          description: "A detailed miniature terrarium world",
      },
      {
      url: "https://image.pollinations.ai/prompt/giant%20treehouse%20in%20the%20forest?nologo=true",
      description: "A large treehouse nestled within the woods",
  },
    {
      url: "https://image.pollinations.ai/prompt/Iron%20man%20and%20Spider%20man%20Fighting%20Thanos?nologo=true",
       description: "Iron man and Spider man Fighting Thanos",
  },
      {
        url: "https://image.pollinations.ai/prompt/peacock%20with%20a%20colorful%20tail?nologo=true",
           description: "A vibrant peacock proudly showing its tail",
     },
  {
   url: "https://image.pollinations.ai/prompt/river%20flowing%20through%20a%20canyon?nologo=true",
     description: "A winding river flows peacefully in a canyon"
  },
   {
     url: "https://image.pollinations.ai/prompt/pirate%20ship%20on%20a%20stormy%20sea?nologo=true",
        description: "A pirate ship battles the waves on a stormy sea",
   },
  {
      url: "https://image.pollinations.ai/prompt/ice%20palace%20under%20the%20northern%20lights?nologo=true",
     description: "A dazzling ice palace under the northern lights",
    },
  {
   url: "https://image.pollinations.ai/prompt/owl%20on%20a%20branch%20in%20the%20moonlight?nologo=true",
       description: "An owl watches from a tree branch on a moonlit night"
  },
  {
    url: "https://image.pollinations.ai/prompt/flying%20saucer%20landing%20in%20a%20field?nologo=true",
       description: "A flying saucer touches down on a field",
   },
   {
   url: "https://image.pollinations.ai/prompt/castle%20on%20a%20hilltop%20with%20a%20view?nologo=true",
        description: "A picturesque castle perched on a hilltop"
   },
  {
     url: "https://image.pollinations.ai/prompt/underwater%20scene%20with%20coral%20and%20fish?nologo=true",
        description: "An underwater realm filled with coral and fish"
   },
    {
      url: "https://image.pollinations.ai/prompt/tea%20cup%20in%20a%20fantasy%20world?nologo=true",
          description: "A tea cup journey in a fanciful place",
    },
     {
        url: "https://image.pollinations.ai/prompt/zen%20garden%20with%20raked%20sand?nologo=true",
          description: "A soothing Zen garden with raked sand patterns",
     },
      {
          url: "https://image.pollinations.ai/prompt/library%20filled%20with%20books?nologo=true",
           description: "A grand library stocked with stories to read"
      },
      {
           url: "https://image.pollinations.ai/prompt/giant%20robot%20in%20a%20city?nologo=true",
         description: "A gigantic robot stands among city skyscrapers"
       },
     {
         url: "https://image.pollinations.ai/prompt/field%20of%20sunflowers%20in%20the%20sun?nologo=true",
      description: "A beautiful sunflower field faces the summer sun"
      },
  {
        url: "https://image.pollinations.ai/prompt/whale%20breaching%20the%20ocean%20surface?nologo=true",
        description: "A whale powerfully breaks the ocean surface",
  },
    {
         url: "https://image.pollinations.ai/prompt/street%20cafe%20in%20paris%20at%20night?nologo=true",
          description: "A Parisian cafe at night, full of stories",
    },
     {
       url: "https://image.pollinations.ai/prompt/samurai%20warrior%20with%20katana%20sword?nologo=true",
         description: "A samurai warrior with their keen katana sword"
     },
     {
       url: "https://image.pollinations.ai/prompt/space%20station%20orbiting%20earth?nologo=true",
          description: "A space station in orbit around planet Earth",
   },
    {
       url: "https://image.pollinations.ai/prompt/violin%20in%20a%20music%20studio?nologo=true",
       description: "A beautiful violin waits in a music studio",
     },
     {
     url: "https://image.pollinations.ai/prompt/unicorn%20in%20a%20magical%20forest?nologo=true",
         description: "A rare unicorn in a mysterious forest",
  },
     {
          url: "https://image.pollinations.ai/prompt/city%20skyline%20at%20twilight?nologo=true",
         description: "The beautiful skyline as day becomes night"
       },
    {
       url: "https://image.pollinations.ai/prompt/panda%20in%20a%20bamboo%20forest?nologo=true",
          description: "A cuddly panda explores its bamboo forest habitat",
    },
    {
        url: "https://image.pollinations.ai/prompt/cliffs%20overlooking%20the%20ocean?nologo=true",
           description: "Majestic cliffs rising from the edge of the ocean",
    },
    {
    url: "https://image.pollinations.ai/prompt/balloon%20animals%20in%20a%20circus?nologo=true",
         description: "A joyful circus filled with playful balloon animals",
  },
    {
       url: "https://image.pollinations.ai/prompt/aurora%20borealis%20over%20a%20landscape?nologo=true",
      description: "A spectacular display of northern lights on a still night",
  },
  {
  url: "https://image.pollinations.ai/prompt/wizard%20with%20a%20staff%20in%20a%20tower?nologo=true",
  description: "A mysterious wizard at the top of their old tower",
  },
     {
         url: "https://image.pollinations.ai/prompt/hot%20chocolate%20by%20a%20fireplace?nologo=true",
         description: "A cup of hot chocolate keeps us warm in winter",
      },
      {
         url: "https://image.pollinations.ai/prompt/knight%20in%20shining%20armor%20on%20a%20horse?nologo=true",
             description: "A knight rides towards their noble quest"
     },
    {
     url: "https://image.pollinations.ai/prompt/caves%20with%20glow%20worms?nologo=true",
     description: "The walls and ceilings of caves are covered in glowworms",
   },
      {
         url: "https://image.pollinations.ai/prompt/time-lapse%20of%20flower%20blooming?nologo=true",
            description: "A beautiful sequence of a flower blooming with grace",
     },
   {
     url: "https://image.pollinations.ai/prompt/abstract%20colorful%20fluid%20art?nologo=true",
          description: "Abstract colors in a flowing, unique art style"
      },
  {
      url: "https://image.pollinations.ai/prompt/monk%20meditating%20in%20a%20temple?nologo=true",
          description: "A devoted monk in a place of worship"
  },
     {
           url: "https://image.pollinations.ai/prompt/garden%20with%20different%20flowers?nologo=true",
         description: "An array of many different flower species together",
    },
  {
         url: "https://image.pollinations.ai/prompt/a%20flying%20cat%20in%20a%20sky?nologo=true",
      description: "A strange yet delightful vision of a flying cat",
  },
     {
        url: "https://image.pollinations.ai/prompt/volcano%20eruption%20at%20night?nologo=true",
          description: "The raw power of a volcanic eruption lights the night",
  },
     {
        url: "https://image.pollinations.ai/prompt/ancient%20ruins%20covered%20in%20plants?nologo=true",
        description: "The beauty of ancient ruins reclaimed by plants",
  },
      {
          url: "https://image.pollinations.ai/prompt/giant%20sequoia%20tree%20in%20the%20forest?nologo=true",
      description: "The majestic stature of a sequoia tree",
    },
    {
         url: "https://image.pollinations.ai/prompt/magical%20potion%20on%20a%20shelf?nologo=true",
            description: "Bottles of magic potions on a dusty shelf",
  },
      {
      url: "https://image.pollinations.ai/prompt/dandelion%20blowing%20in%20the%20wind?nologo=true",
         description: "The wind carries away the fluff of a dandelion"
      },
    {
          url: "https://image.pollinations.ai/prompt/a%20girl%20playing%20with%20bubbles?nologo=true",
     description: "The magic of children enjoying bubbles"
  },
  {
   url: "https://image.pollinations.ai/prompt/astronaut%20in%20a%20zero%20gravity?nologo=true",
  description: "An astronaut floats gently in space"
  },
  {
     url: "https://image.pollinations.ai/prompt/koi%20fish%20in%20a%20pond?nologo=true",
      description: "A school of koi fish swimming peacefully in a pond",
    },
      {
           url: "https://image.pollinations.ai/prompt/mandala%20pattern%20with%20symmetry?nologo=true",
              description: "A symmetrical mandala with rich patterns and depth",
   },
    {
         url: "https://image.pollinations.ai/prompt/fireflies%20glowing%20in%20a%20night?nologo=true",
        description: "Fireflies paint the darkness with glowing magic"
  },
     {
          url: "https://image.pollinations.ai/prompt/castle%20interior%20with%20arches?nologo=true",
       description: "Beautiful arches in the halls of a medieval castle",
  },
    {
        url: "https://image.pollinations.ai/prompt/map%20of%20fantasy%20lands?nologo=true",
       description: "A drawn map of magical far off kingdoms",
  },
    {
        url: "https://image.pollinations.ai/prompt/vintage%20camera%20with%20a%20photo%20lens?nologo=true",
           description: "A photo taken with an old vintage camera and lense",
  },
     {
      url: "https://image.pollinations.ai/prompt/skater%20performing%20tricks%20at%20a%20park?nologo=true",
    description: "A skateboarder in action at the skatepark"
  },
  {
   url: "https://image.pollinations.ai/prompt/birds%20flying%20over%20a%20sunrise?nologo=true",
       description: "A beautiful vision of birds against a rising sun"
  },
  {
  url: "https://image.pollinations.ai/prompt/scuba%20diver%20exploring%20a%20reef?nologo=true",
  description: "A deepsea diver taking the time to see some wonders",
  },
   {
      url: "https://image.pollinations.ai/prompt/chef%20baking%20bread%20in%20a%20kitchen?nologo=true",
       description: "A chef showing their culinary mastery in their kitchen",
   },
      {
        url: "https://image.pollinations.ai/prompt/old%20record%20player%20with%20a%20record?nologo=true",
           description: "The beauty of vinyl with a spinning record"
  },
  {
    url: "https://image.pollinations.ai/prompt/swing%20set%20under%20a%20starry%20night?nologo=true",
          description: "A childs swingset at night on a dark sky",
  },
    {
          url: "https://image.pollinations.ai/prompt/robot%20in%20a%20mechanic%20shop?nologo=true",
          description: "A maintenance robot on standby"
    },
   {
    url: "https://image.pollinations.ai/prompt/lion%20and%20lioness%20in%20a%20grassland?nologo=true",
      description: "A loving pair of lion and lioness sharing the wild",
   },
  {
     url: "https://image.pollinations.ai/prompt/tree%20with%20swing%20on%20a%20river%20bank?nologo=true",
          description: "The natural harmony with swing along side the water",
      },
  {
     url: "https://image.pollinations.ai/prompt/colorful%20jellyfish%20in%20deepsea?nologo=true",
      description: "Colorful life among jellyfish",
    },
  {
     url: "https://image.pollinations.ai/prompt/egyptian%20pharaoh%20with%20crown?nologo=true",
      description: "The wisdom of the Egyptian Pharaohs is shown on this one",
  },
     {
           url: "https://image.pollinations.ai/prompt/dramatic%20ocean%20storm?nologo=true",
            description: "Mother nature shows us the awesome and scary at once",
   },
      {
        url: "https://image.pollinations.ai/prompt/dog%20reading%20a%20book%20on%20a%20couch?nologo=true",
            description: "What we all like to imagine, a clever dog is smart as you and me",
    },
   {
    url: "https://image.pollinations.ai/prompt/planet%20landscape%20with%20two%20moons?nologo=true",
     description: "A dreamy scene with two moons on an exotic world",
  },
    {
       url: "https://image.pollinations.ai/prompt/cat%20wearing%20glasses%20with%20books?nologo=true",
           description: "If only they could speak, they always look so wise"
    },
      {
           url: "https://image.pollinations.ai/prompt/graffiti%20art%20on%20a%20building%20wall?nologo=true",
              description: "Street art of graffiti adding some color to city walls",
     },
  {
      url: "https://image.pollinations.ai/prompt/fox%20in%20the%20woods?nologo=true",
   description: "The graceful and quiet fox is among nature"
  },
    {
         url: "https://image.pollinations.ai/prompt/old%20typewriter%20with%20a%20paper?nologo=true",
           description: "The beauty of written word on paper with an old tool",
    },
      {
         url: "https://image.pollinations.ai/prompt/water%20ripples%20on%20a%20lake?nologo=true",
              description: "A relaxing look on gentle water and small waves"
      },
  {
     url: "https://image.pollinations.ai/prompt/ballet%20dancer%20performing%20on%20stage?nologo=true",
       description: "An artist ballerina shows poise and skill",
      },
  {
   url: "https://image.pollinations.ai/prompt/train%20passing%20through%20a%20tunnel?nologo=true",
       description: "An epic train goes into an enclosed passage",
   },
   {
     url: "https://image.pollinations.ai/prompt/penguin%20walking%20in%20antarctica?nologo=true",
        description: "The always fun and adorable penguin on the frozen lands"
  },
  {
      url: "https://image.pollinations.ai/prompt/astronaut%20on%20mars%20surface?nologo=true",
      description: "The intrepid exploring life with a footprint on another planet",
  },
    {
      url: "https://image.pollinations.ai/prompt/iceberg%20in%20the%20open%20ocean?nologo=true",
           description: "Giant monuments of frozen waters as seen from a distance"
    },
      {
          url: "https://image.pollinations.ai/prompt/magician%20performing%20tricks%20on%20a%20stage?nologo=true",
         description: "A gifted master of prestidigitation performs",
     },
  {
         url: "https://image.pollinations.ai/prompt/castle%20floating%20in%20the%20sky?nologo=true",
       description: "Floating wonder of stone and rock defying logic",
  },
     {
         url: "https://image.pollinations.ai/prompt/city%20view%20with%20rain%20at%20night?nologo=true",
        description: "A nighttime city view with rain adding to atmosphere",
   },
      {
        url: "https://image.pollinations.ai/prompt/coffee%20latte%20with%20latte%20art?nologo=true",
      description: "A beautiful designed latte is the morning to have"
   },
      {
     url: "https://image.pollinations.ai/prompt/dragon%20in%20a%20cave?nologo=true",
       description: "Fearsome magic is alive among the scaly reptile",
     },
     {
         url: "https://image.pollinations.ai/prompt/colorful%20koi%20fish%20swimming%20together?nologo=true",
       description: "Multiple Koi with graceful fins together is always a good look"
     },
      {
     url: "https://image.pollinations.ai/prompt/clock%20in%20a%20vintage%20setting?nologo=true",
       description: "Beauty in its simplest with intricate metal work in gears",
   },
       {
   url: "https://image.pollinations.ai/prompt/rainbow%20over%20a%20farm%20field?nologo=true",
        description: "Beauty even in simpler everyday views",
       },
       {
     url: "https://image.pollinations.ai/prompt/a%20treehouse%20with%20light%20on%20a%20moonlight%20night?nologo=true",
       description: "The childhood wonder of an open window, looking at trees"
        },
          {
              url: "https://image.pollinations.ai/prompt/sunset%20over%20a%20beach?nologo=true",
                 description: "The ocean view sunset brings inner calm"
        }
    ];
        return staticImageArray
    }


    const sortImage = useCallback((arr: { url: string; description: string }[]) => {
        return [...arr].sort(() => Math.random() - 0.5)

    }, []);

    const initialImages = sortImage(generateImages()).slice(0, 105)

    useEffect(() => {
        setImagePrompts(imagePrompts => [imagePrompts[0], imagePrompts[1], ...initialImages])

    }, [sortImage]);

    const downloadImage = async (imageUrl: string, description: string) => {
        try {
            const response = await fetch(imageUrl, {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' }));
            const link = document.createElement("a");
            link.href = url;

            const sanitizedDescription = description.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
            link.setAttribute("download", `${sanitizedDescription}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };


    const handlePaintBrushClick = async () => {
        handleSearchSubmit()
    }
    const handleSearchSubmit = async () => {
        const searchTerm = searchInputRef.current?.value?.trim() || '';
        if (searchTerm) {
            setIsLoading(true);
            setFirstGenImg('https://placekitten.com/600/400');
            setSecondGenImg('https://placekitten.com/601/400')
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));


                const fetchImages = await Promise.all([
                    fetch(
                        `https://image.pollinations.ai/prompt/${searchTerm}?nologo=true&model=flux-pro`, {
                        method: "GET",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                    ).catch(error => {
                        console.error('First fetch failed:', error)
                        return { ok: false, status: 0, url: '' }
                    }),
                    fetch(
                        `https://image.pollinations.ai/prompt/${searchTerm} art painting?nologo=true&model=flux-pro`, {
                        method: "GET",
                         mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                    ).catch(error => {
                        console.error('Second fetch failed:', error)
                        return { ok: false, status: 0, url: '' }
                    })
                ]);
                const checkFetchs = fetchImages.map(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res
                })

                const imageUrls = await Promise.all(checkFetchs.map(res => res.url));
                setFirstGenImg(imageUrls[0]);
                setSecondGenImg(imageUrls[1])
                setImagePrompts(prevPrompts => {
                    const newPrompts = [...prevPrompts];
                    newPrompts[0] = { ...newPrompts[0], url: imageUrls[0] };
                    newPrompts[1] = { ...newPrompts[1], url: imageUrls[1] };
                    return newPrompts;
                });

            } catch (err) {
                console.error('error with the search: ', err)

                setFirstGenImg('https://placekitten.com/600/400');
                setSecondGenImg('https://placekitten.com/601/400');
            } finally {
                setIsLoading(false);
            }
        }

    };



    const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchSubmit();
        }
    };


    const createSection = (sectionImages: { url: string; description: string }[]) => {
        const sections: { url: string; description: string }[][] = []
        for (let i = 0; i < sectionImages.length; i += 3) {
            sections.push(sectionImages.slice(i, i + 3))
        }
        return sections
    }
    return (
        <main className="w-full min-h-screen appGradient text-white p-6 flex flex-col items-center space-y-8" >
            {/* Header */}
            <header className="w-full text-center py-4 relative z-10 ">
                <img
                    src="https://i.ibb.co/5W5Y7hY/logo.png"
                    alt="MindBot Logo"
                    className="h-[120px] mx-auto relative"
                />
            </header>

            {/* Search Box */}
             <div className="relative w-full max-w-lg flex items-center">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Generate Amazing Images By MindPaint!"
                    className="w-full bg-gray-800 rounded-md p-3  focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                    onKeyDown={handleEnterKeyDown}
                />
                  <div
                        onClick={handlePaintBrushClick}
                        className=" absolute  right-0  flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-300
                        hover:text-white active:text-white   rounded-full
                        "
                        style={{
                            padding: '10px',
                            paddingRight: '12px',
                            paddingLeft: '12px',
                        }}
                    >
                        <div className="rounded-full hover:bg-blue-500 active:bg-blue-500  hover:bg-opacity-50 active:bg-opacity-70 transition-colors duration-300" style={{
                            padding: '1px',
                            width:'50px',
                            height:'50px',
                              display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                        }}>
                            <FaPaintBrush style={{
                                padding: '4px',
                                fontSize: '1.6em',
                            }} />
                        </div>
                    </div>

            </div>
            {isLoading && <span className="relative flex w-full max-w-lg text-white justify-center items-center "> Generating new amazing images! <span className="animate-spin rounded-full h-4 w-4  ml-3 mt-1 border-b-2 border-white"> </span>  </span>}



            {/* Image Section */}
            <div className="flex space-x-4">
                {imagePrompts.slice(0, 2).map((image, index) => (
                    <div key={index} className="relative">
                        <img
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            className="w-[300px] h-[200px] object-cover rounded-lg"
                            onMouseEnter={() => setHoveredImage(image.url)}
                            onMouseLeave={() => setHoveredImage(null)}
                        />
                            <div
                                className="absolute bottom-2 right-2  flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-lg transition-opacity duration-300"
                                onClick={() => downloadImage(image.url, image.description)}
                            >
                                <FaDownload className="text-white text-2xl"  />
                            </div>


                    </div>
                ))}
            </div>

            {/* Separator */}
            <hr className="border-t-2 border-gray-700 w-full max-w-4xl my-6" />


            {/* Content Sections */}
            <section className="w-full max-w-4xl space-y-6">
                {createSection(imagePrompts.slice(2)).map((section, sectionIndex) => (
                    <div key={sectionIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {section.map((image, index) => (
                            <div key={index} className="relative" >
                                <img
                                    src={image.url}
                                    alt={`Image : ${sectionIndex + 1}, Number ${index + 1}`}
                                    className="w-full h-40 object-cover rounded-lg"
                                    onMouseEnter={() => setHoveredImage(image.url)}
                                    onMouseLeave={() => setHoveredImage(null)}
                                />
                                <div
                                    className="absolute bottom-2 right-2 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer rounded-lg transition-opacity duration-300"
                                    onClick={() => downloadImage(image.url, image.description)}
                                >
                                    <FaDownload className="text-white text-2xl" />
                                </div>
                                <p className="text-sm text-gray-400">{image.description}</p>
                            </div>

                        ))}
                    </div>
                ))}
            </section>
        </main>
    );
};

export default HomePage;
