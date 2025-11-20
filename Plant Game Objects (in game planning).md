### **Plant Game Objects (in game planning)**



##### **State Machine**



**State Morning** ~ 

\[visual]background: morning 

\[physical]button available: {button ->}Travel \[-1 energy] \[+?water] \[+?nutrients]

\[message]good morning



Entering State Noon you have a random 1/4 chance of an event popping up {"boss battle"} \[-1 energy]



**State Noon** ~ 

\[visual]background: noon 

\[physical]button available: {button ->}Tend plant \[-1 or -2 energy]

\[message]you have returned from your trip



**State Night** ~ 

\[visual]background: night

\[physical]button available: {button ->}Sleep \[+3 energy] \[+mutation]

\[message]tended



#### **Objects**



**Plant**

* water {start: 5, minimum: 0, maximum: 10}
* nutrients {start: 5, minimum: 0, maximum: 10}
* health {=(water+nutrients/2), min(water, nutrients) = 0 -> end}
* mutations {enum: none, carnivorous, hibiscus, rose, sunflower, cactus} {they will apear on default texture} {only visual}



**Player**

* energy {start: 3}



**Garden**

* water bucket {minimum: 0}
* nutrients box {minimum: 0}



**Date** {start: 1, 1 <-> 30, end: 30}



**Time of Day** {morning, noon, night) {work-a-like states}



#### **Actions**



{button ->} Tend plant {

&nbsp;	{buton ->} Water plant {\[visual] anim: character waters the plant, 

&nbsp;	\[physical] waterbucket~-; water~+;}



 	{buton ->} Fertilize plant {\[visual] anim: character ... the plant,

&nbsp;	\[physical] nutrientsbox~-; nutrients~+;}

}



{button ->} Travel {\[]}



{button ->} Sleep {}

