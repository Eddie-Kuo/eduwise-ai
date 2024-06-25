/**
 * This file contains the functions that interact with the OpenAI API.
 * The purpose of the strict_output function is to ensure the consistency of the results generated by OpenAI to be JSON.
 */

import OpenAi from "openai";

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

type OutputFormat = {
  [key: string]: string | string;
};

export async function strict_output(
  system_prompt: string,
  user_prompt: string,
  output_format: OutputFormat,
  model: string = "gpt-3.5-turbo",
) {
  let output_format_prompt = `\nOutput in the following json string format: " + ${JSON.stringify(output_format)} + "\nBe concise. \nDo not put quotation marks or escape character \\ in the output fields.`;

  let my_system_prompt = `${JSON.stringify(system_prompt)} + ${JSON.stringify(output_format_prompt)}`;

  try {
    const response = await openai.chat.completions.create({
      temperature: 1,
      model: model,
      messages: [
        {
          role: "system",
          content: my_system_prompt,
        },
        { role: "user", content: user_prompt.toString() },
      ],
    });

    let res: string =
      response.choices[0].message?.content?.replace(/'/g, '"') ?? "";

    if (res.length) {
      // remove leading and unwanted backslashes
      res = res.replace(/\\/g, "");
      // ensure that we don't replace away apostrophes in text
      res = res.replace(/(\w)"(\w)/g, "$1'$2");

      let output: any = JSON.parse(res);

      return output;
    }

    return res;
  } catch (error) {
    console.log("ERROR: Error when generating with OpenAI:", error);
    return {};
  }
}

export async function generateSummary(
  system_prompt: string,
  user_prompt: string,
  model: string = "gpt-3.5-turbo",
) {
  try {
    const response = await openai.chat.completions.create({
      temperature: 1,
      model: model,
      messages: [
        {
          role: "system",
          content: system_prompt,
        },
        { role: "user", content: user_prompt.toString() },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    return "";
  }
}

