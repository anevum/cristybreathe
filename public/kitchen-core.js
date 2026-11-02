'use strict';
// Pure, provider-independent kitchen planning model. No storage, payment, or network writes.
(function (scope) {
  const ingredients = {
    chicken:{name:'Boneless chicken thighs',department:'Meat & protein',unit:'lb',pack:1,package:'1 lb pack'},
    beef:{name:'Ground beef',department:'Meat & protein',unit:'lb',pack:1,package:'1 lb pack'},
    turkey:{name:'Ground turkey',department:'Meat & protein',unit:'lb',pack:1,package:'1 lb pack'},
    eggs:{name:'Eggs',department:'Dairy & chilled',unit:'egg',pack:12,package:'dozen'},
    potatoes:{name:'Potatoes',department:'Produce',unit:'lb',pack:1,package:'1 lb'},
    broccoli:{name:'Broccoli florets',department:'Produce',unit:'lb',pack:1,package:'1 lb bag'},
    carrots:{name:'Carrots',department:'Produce',unit:'lb',pack:1,package:'1 lb bag'},
    peppers:{name:'Bell peppers',department:'Produce',unit:'pepper',pack:1,package:'each'},
    onions:{name:'Yellow onions',department:'Produce',unit:'onion',pack:1,package:'each'},
    lemons:{name:'Lemons',department:'Produce',unit:'lemon',pack:1,package:'each'},
    limes:{name:'Limes',department:'Produce',unit:'lime',pack:1,package:'each'},
    garlic:{name:'Garlic',department:'Produce',unit:'clove',pack:10,package:'bulb (about 10 cloves)'},
    scallions:{name:'Green onions',department:'Produce',unit:'bunch',pack:1,package:'bunch'},
    spinach:{name:'Baby spinach',department:'Produce',unit:'bag',pack:1,package:'bag'},
    tortillas:{name:'Flour tortillas',department:'Bread & grains',unit:'tortilla',pack:10,package:'10-count pack'},
    pasta:{name:'Dry pasta',department:'Bread & grains',unit:'lb',pack:1,package:'1 lb box'},
    rice:{name:'Dry rice',department:'Bread & grains',unit:'lb',pack:1,package:'1 lb bag'},
    breadcrumbs:{name:'Breadcrumbs',department:'Bread & grains',unit:'cup',pack:2,package:'2-cup container'},
    beans:{name:'Black beans',department:'Pantry',unit:'can',pack:1,package:'15 oz can'},
    tomatoes:{name:'Crushed tomatoes',department:'Pantry',unit:'can',pack:1,package:'28 oz can'},
    frozenveg:{name:'Frozen mixed vegetables',department:'Frozen',unit:'bag',pack:1,package:'1 lb bag'},
    cheese:{name:'Shredded cheddar',department:'Dairy & chilled',unit:'bag',pack:1,package:'8 oz bag'},
    parmesan:{name:'Grated Parmesan',department:'Dairy & chilled',unit:'container',pack:1,package:'small container'},
    oil:{name:'Olive oil',department:'Pantry',unit:'tbsp',pack:32,package:'16 fl oz bottle'},
    soy:{name:'Soy sauce',department:'Pantry',unit:'tbsp',pack:20,package:'10 fl oz bottle'},
    seasoning:{name:'Taco seasoning',department:'Pantry',unit:'packet',pack:1,package:'packet'},
    mustard:{name:'Dijon mustard',department:'Pantry',unit:'tbsp',pack:16,package:'small jar'},
    honey:{name:'Honey',department:'Pantry',unit:'tbsp',pack:16,package:'small bottle'},
    salt:{name:'Salt',department:'Pantry',unit:'tsp',pack:40,package:'small container'},
    pepper:{name:'Black pepper',department:'Pantry',unit:'tsp',pack:20,package:'small container'}
  };
  // Amounts are for six servings. Cooked food must be checked with a thermometer where indicated.
  const recipes = [
    {id:'lemon-chicken',title:'Lemon garlic chicken',subtitle:'Roasted potatoes and broccoli',minutes:45,active:15,category:'SHEET PAN',ingredients:{chicken:2.5,potatoes:2.5,broccoli:1.5,lemons:2,garlic:5,oil:3,salt:1,pepper:0.5},steps:['Heat oven to 425°F. Wash produce. Cut potatoes into even wedges and broccoli into florets.','Toss potatoes with about two-thirds of the measured oil and half of the measured salt. Roast on a lined sheet pan for 15 minutes.','Add chicken, broccoli, remaining oil, chopped garlic and lemon juice. Spread everything in a single layer.','Roast until the chicken reaches 165°F in the thickest part on a food thermometer and the vegetables are tender. Rest chicken for 3 minutes before serving.']},
    {id:'beef-tacos',title:'Family taco night',subtitle:'Beef, black beans and peppers',minutes:30,active:20,category:'FAMILY FAVORITE',ingredients:{beef:2,beans:2,tortillas:15,peppers:2,onions:1,cheese:1,seasoning:1,limes:2,oil:1},steps:['Dice peppers and onion. Drain and rinse the black beans.','In a large skillet, warm oil and soften vegetables. Add ground beef, breaking it into small pieces.','Cook ground beef to 160°F with a food thermometer. Stir in beans, seasoning and a little water; simmer 5 minutes.','Warm tortillas and serve with the filling, shredded cheese and lime wedges. Check tortilla and seasoning labels for allergens.']},
    {id:'turkey-pasta',title:'Sunday-style pasta',subtitle:'Tomato, turkey and spinach',minutes:35,active:15,category:'ONE POT SAUCE',ingredients:{turkey:2,pasta:1.5,tomatoes:2,onions:1,garlic:4,spinach:1,parmesan:1,oil:2},steps:['Boil a large pot of water and cook pasta according to its package instructions. Reserve some cooking water.','Chop onion and garlic. Heat oil in a deep skillet and soften onion for 5 minutes, then add garlic.','Add turkey and cook until it reaches 165°F on a food thermometer. Stir in crushed tomatoes and simmer 10 minutes.','Fold in spinach until wilted. Toss with drained pasta and a splash of pasta water. Serve with Parmesan; check labels for allergens.']},
    {id:'fajita-bowls',title:'Chicken fajita rice bowls',subtitle:'Peppers, beans and fluffy rice',minutes:35,active:20,category:'BOWL NIGHT',ingredients:{chicken:2.5,rice:1.5,peppers:3,onions:1,beans:2,limes:2,seasoning:1,oil:2},steps:['Cook rice according to the package instructions. Drain and rinse beans.','Slice chicken, peppers and onion on separate prep surfaces. Heat oil in a large skillet.','Cook chicken with seasoning until it reaches 165°F on a food thermometer. Remove to a clean dish.','Cook peppers and onions until tender. Heat beans thoroughly, then build bowls with rice, chicken, vegetables and lime wedges.']},
    {id:'vegetable-fried-rice',title:'Cozy vegetable fried rice',subtitle:'Egg, vegetables and green onion',minutes:25,active:15,category:'QUICK SUPPER',ingredients:{rice:1.25,eggs:6,frozenveg:2,scallions:1,soy:4,oil:2},steps:['Cook rice according to package instructions and cool it quickly before use. Never leave cooked rice sitting at room temperature.','Scramble the eggs in a hot skillet with a little oil until fully set. Transfer to a clean plate.','Stir-fry frozen vegetables until hot all the way through. Add rice and soy sauce, stirring until steaming hot.','Return eggs to the skillet, fold in sliced green onions and serve immediately. Refrigerate leftovers promptly. Soy sauce often contains wheat and soy.']},
    {id:'mustard-chicken',title:'Honey mustard chicken',subtitle:'Carrots and golden potatoes',minutes:45,active:15,category:'SHEET PAN',ingredients:{chicken:2.5,potatoes:2,carrots:2,mustard:3,honey:2,oil:2,garlic:3},steps:['Heat oven to 425°F. Cut potatoes and carrots to similar sizes.','Toss vegetables in oil and arrange on a sheet pan. Start roasting for 15 minutes.','Whisk mustard, honey and minced garlic. Brush chicken with the sauce, then place it on the pan beside the vegetables.','Roast until chicken reaches 165°F on a food thermometer and vegetables are tender. Let chicken rest for 3 minutes. Check mustard packaging for ingredients.']},
    {id:'meatball-pasta',title:'Turkey meatball spaghetti',subtitle:'Tomato sauce and Parmesan',minutes:50,active:25,category:'WEEKEND COMFORT',ingredients:{turkey:2,eggs:2,breadcrumbs:1,pasta:1.5,tomatoes:2,garlic:4,parmesan:1,oil:1},steps:['Heat oven to 400°F. Mix turkey, eggs and breadcrumbs with clean hands; form evenly sized meatballs.','Place meatballs on a lined baking tray. Bake until the center of each reaches 165°F on a food thermometer.','Simmer tomatoes with minced garlic and a little oil. Cook pasta according to the package directions.','Toss pasta with sauce and top with meatballs and Parmesan. Check breadcrumb and cheese packaging for allergens.']}
  ];
  const defaultMeals=['lemon-chicken','beef-tacos','turkey-pasta','fajita-bowls','vegetable-fried-rice'];
  const allowed=new Set(Object.keys(ingredients));
  function assert(ok,message){if(!ok)throw new Error(message);}
  function number(n){return Math.round((n+Number.EPSILON)*100)/100;}
  function makePlan({mealIds=defaultMeals,servings=6,pantry=[],excluded=[],version=1}={}){
    assert(Array.isArray(mealIds)&&mealIds.length===5&&new Set(mealIds).size===5,'Choose five different dinners.');
    assert(Number.isInteger(servings)&&servings>=4&&servings<=10,'Choose between 4 and 10 portions.');
    assert(Array.isArray(pantry)&&pantry.every(x=>allowed.has(x)),'The pantry list contains an unknown item.');
    assert(Array.isArray(excluded)&&excluded.every(x=>allowed.has(x)),'An excluded ingredient is unknown.');
    assert(Number.isInteger(version)&&version>=1,'Invalid plan version.');
    const selected=mealIds.map(id=>{const recipe=recipes.find(r=>r.id===id);assert(recipe,'An unknown dinner was selected.');return recipe;});
    const avoided=new Set(excluded);
    assert(selected.every(r=>Object.keys(r.ingredients).every(id=>!avoided.has(id))),'A selected dinner contains an excluded ingredient. Please select other meals.');
    const amounts=new Map();const usedBy=new Map();
    for(const recipe of selected)for(const [id,qty] of Object.entries(recipe.ingredients)){
      assert(allowed.has(id)&&qty>0,'An ingredient cannot be calculated.');
      amounts.set(id,(amounts.get(id)||0)+qty*servings/6);
      usedBy.set(id,[...(usedBy.get(id)||[]),recipe.id]);
    }
    const available=new Set(pantry);
    const rows=[...amounts].map(([id,raw])=>{
      const i=ingredients[id];const required=number(raw);const packages=Math.ceil((raw-0.000001)/i.pack);
      return {id,name:i.name,department:i.department,required,unit:i.unit,packages,package:i.package,recipes:usedBy.get(id),have:available.has(id)};
    }).sort((a,b)=>a.department.localeCompare(b.department)||a.name.localeCompare(b.name));
    return {version,servings,mealIds:[...mealIds],pantry:[...available],excluded:[...avoided],meals:selected.map(r=>({id:r.id,title:r.title,subtitle:r.subtitle,minutes:r.minutes,active:r.active,category:r.category,servings,steps:[...r.steps]})),items:rows,shoppingItems:rows.filter(r=>!r.have),priced:false,retailerConnected:false};
  }
  function swap(plan,index,id){assert(Number.isInteger(index)&&index>=0&&index<5,'Choose a valid dinner.');assert(recipes.some(r=>r.id===id),'Choose an available recipe.');const ids=[...plan.mealIds];ids[index]=id;return makePlan({mealIds:ids,servings:plan.servings,pantry:plan.pantry,excluded:plan.excluded,version:plan.version+1});}
  function changeServings(plan,servings){return makePlan({mealIds:plan.mealIds,servings,pantry:plan.pantry,excluded:plan.excluded,version:plan.version+1});}
  function setPantry(plan,id,have){assert(allowed.has(id),'Unknown pantry item.');return makePlan({mealIds:plan.mealIds,servings:plan.servings,pantry:have?[...new Set([...plan.pantry,id])]:plan.pantry.filter(x=>x!==id),excluded:plan.excluded,version:plan.version+1});}
  function listText(plan){return 'THE KITCHEN — WEEKLY GROCERIES\nUnpriced draft · Verify food restrictions and pantry\nVersion '+plan.version+'\n\n'+plan.shoppingItems.map(i=>`${i.name}: ${i.packages} × ${i.package} (recipe needs ${i.required} ${i.unit})`).join('\n')+'\n\nNo retailer cart has been created.';}
  scope.CristyKitchenCore=Object.freeze({ingredients,recipes,defaultMeals,makePlan,swap,changeServings,setPantry,listText});
})(globalThis);