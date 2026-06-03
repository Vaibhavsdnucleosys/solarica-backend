import { build2HPPumpHTML } from "./pump/pump2hp.template";
import { build3HPPumpHTML } from "./pump/pump3hp.template";
import { build5HPPumpHTML } from "./pump/pump5hp.template";


export const buildPumpEstimateHTML = (data:any)=>{
    
   switch(data.systemCapacity?.trim()){

      case "2 HP":
          return build2HPPumpHTML(data);

      case "3 HP":
          return build3HPPumpHTML(data);

      case "5 HP":
          return build5HPPumpHTML(data);

    //   case "7.5 HP":
    //       return build75HPPumpHTML(data);

      default:
          return build2HPPumpHTML(data);
   }
};