import { SingleTrackResponse } from "../types/spotifywebapi";
import HandleMessageVariables from "./HandleMessageVariables";
const variableRegex = /\${(.*?)}/g;

export default async function (message: string, songDetails: SingleTrackResponse, channelID: number): Promise<string> {
  let messageArray = message.trim().split(" ");
  const newArray = await Promise.all(
    messageArray.map(async (word, index) => {
      //if it has a variable
      if (word.match(variableRegex)) {
        //get inside of the variable
        const variable = word.match(variableRegex)![0].replace("${", "").replace("}", "");

        //get the value of from the database
        const value = await HandleMessageVariables(variable, songDetails, channelID);

        //replace the variable with the value
        const newWord = word.replace(variableRegex, value?.toString() || "");
        
        //return the new word
        return newWord;
      } else {
        return word;
      }
    })
  );
  return newArray.join(" ");
}
