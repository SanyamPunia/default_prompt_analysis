"use client";

import { useState } from "react";
import OpenAI from "openai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface StepResponse {
  markdown: string;
  json: Record<string, unknown>;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [response, setResponse] = useState<string | Promise<string>>("");
  const [jsonResponse, setJsonResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [machineName, setMachineName] = useState<string>("");

  const handleMachineNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMachineName(event.target.value);
  };

  const generateSteps = (machineName: string): string[] => {
    return [
      `Step 1: Provide a detailed breakdown of metals vs other materials for the ${machineName}. Include the **exact weight distribution** of metals versus other materials (e.g., 80-85% metals vs 10-15% other materials for a Tunnel Boring Machine). **Ensure that both columns: 'Weight Distribution' and 'Chemical Composition (Major Elements)' are populated for all materials**, including metals, plastics, rubber, glass, and any other significant materials. Provide percentages for each material type and in the 'Chemical Composition' column, list the **major elements and their percentages** (e.g., Steel: C - 0.9%, Mn - 1.0%, Fe - 98.1%). Present this information **in tabular form only**, ensuring no material is left out and all columns are correctly populated. Ensure accuracy in all data.`,

      `Step 2: Identify all components of the ${machineName} and provide an **in-depth analysis** of the **chemical composition of metals used** in each component (e.g., motherboard, casing, screen, keyboard, etc.). For each component, specify the **exact weight distribution for each material** (e.g., Aluminum - 30%, Steel - 40%, Plastic - 20%, Glass - 10%), and in the **'Chemical Composition'** column, provide the major elements of each metal in **percentage terms** (e.g., Aluminum - Al: 99.5%, Si: 0.5%). For non-metal materials, ensure to mention the type of plastic, rubber, or other materials used. **Ensure that the 'Weight Distribution' and 'Chemical Composition (Major Elements)' columns are filled in completely for each component and sub-part.** Add additional columns to include the **scrap price per metric ton** for each material (e.g., Aluminum - $1,500 USD/MT, Plastic - $500 USD/MT, etc.). If any data for a particular material is not available, provide an estimated range for the weight distribution and scrap price, and mention the uncertainty. Present the response **in tabular form only** and ensure all data is accurate.`,

      `Step 3: Provide an **industry benchmark for weight distribution** of similar electronic devices or consumer electronics, and compare these benchmarks with the data from Step 2. Identify any deviations in weight distribution. **Ensure the total weight distribution for each component and sub-part adds up to 100%**, and if any discrepancies occur, correct them. **Revisit the 'Weight Distribution' and 'Chemical Composition (Major Elements)' columns to ensure they are complete and accurate for both the benchmarks and the actual data.** Present this information **in tabular form only** and ensure that the weight distribution and chemical composition data are consistent and accurate.`,

      `Step 4: Develop a **simplified empirical formula** that can be used to identify the weight proportionality for the ${machineName}. Present the formula in **plain text format** (e.g., "Weight Proportionality = X * Y + Z") and make sure it uses only symbols for clarity. **Explain each variable and its significance** in terms of the components and their weight distribution. Emphasize that the formula should account for weight and material composition accurately, without any missing data. **Ensure that the 'Weight Distribution' and 'Chemical Composition' fields are fully considered when developing this formula**. Present the response **in tabular form only** and ensure accuracy in the formula and its explanation.`,

      `Step 5: In a **separate tabular output**, provide an example of a commonly used machine in the same category as the ${machineName}, showing its weight and exact specifications. These specifications should be proportional to the weight based on **industry standards**. Include all relevant **technical parameters**, **operating conditions**, and **performance metrics** for this machine. **Ensure that the weight distribution and chemical composition data** for this machine is included as well. Verify that these specifications are consistent with the weight distribution and formula presented in Step 4. Present this information **in tabular form only** and ensure all columns are populated accurately.`,

      `Step 6: Provide **real-life machine manufacturer examples** that support the weight and specifications from Step 4. Include detailed product specifications, pricing (if available), and direct links to product pages on 'amazon.com' and 'amazon.in'. Compare these real-life examples with the specifications and weight distribution mentioned in previous steps. **Ensure that both 'Weight Distribution' and 'Chemical Composition' columns are present in these real-life examples** as well. Extend the specifications by adding additional columns where necessary, based on the number of **weight-proportional parameters** from Step 4. Present this information **in tabular form only** and ensure that all data is accurate and consistent.`,
    ];
  };

  async function getStepResponse(step: string): Promise<StepResponse> {
    try {
      const result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content:
              "You are an expert assistant specializing in industrial machinery analysis. Provide extremely precise and concise responses, focusing solely on measurable metrics, values, and numeric data. All responses should be in tabular form, with a focus on constituent metrics and numeric precision. Ensure that any formulas provided are in simple text (not markdown), using only symbols so they are easily understandable by humans. Avoid lengthy explanations and descriptive text. Your tables should include exact numeric data, such as percentage compositions, weights, dimensions, and technical specifications. All output should be formatted properly in markdown to ensure correct rendering on web platforms, especially for tables and data structures.",
          },
          { role: "user", content: step },
        ],
        max_tokens: 5000,
        temperature: 0.7,
      });

      const content =
        result.choices[0].message.content || "No response generated.";
      let jsonContent: Record<string, unknown> = {};
      let markdownContent = content;

      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonContent = JSON.parse(jsonMatch[1]);
          markdownContent = content.replace(/```json\n[\s\S]*?\n```/, "");
        } else {
          console.warn("No JSON content found in the response");
        }
      } catch (error) {
        console.error("Error parsing JSON from response:", error);
      }

      return {
        markdown: markdownContent,
        json: jsonContent,
      };
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return {
        markdown: "An error occurred while generating the response.",
        json: {},
      };
    }
  }

  const handleGenerateResponse = async (): Promise<void> => {
    if (!machineName.trim()) {
      alert("Please enter a machine name.");
      return;
    }

    setIsLoading(true);
    setResponse("");
    setJsonResponse("");
    const steps = generateSteps(machineName);

    let responseText = "";
    const jsonResponseObj: Record<string, Record<string, unknown>> = {};
    for (const step of steps) {
      const stepResponse = await getStepResponse(step);
      responseText += `## ${step}\n\n${stepResponse.markdown}\n\n`;
      jsonResponseObj[step.replace(/^Step \d+: /, "")] = stepResponse.json;
    }

    const htmlContent = marked(responseText);
    setResponse(htmlContent);
    setJsonResponse(JSON.stringify(jsonResponseObj, null, 2));
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Detailed Machine Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              value={machineName}
              onChange={handleMachineNameChange}
              placeholder="Enter Machine Name"
              className="w-full p-3 border rounded-md"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading}
            className="w-full mb-8 flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Generating Detailed
                Analysis...
              </>
            ) : (
              "Generate In-Depth Analysis"
            )}
          </Button>

          {response && (
            <div className="mt-8 p-4 border border-gray-300 rounded">
              <h2 className="text-xl font-semibold mb-2">
                Detailed AI Analysis:
              </h2>
              <div className="markdown-container">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: response }}
                ></div>
              </div>
            </div>
          )}

          {jsonResponse && (
            <div className="mt-8 p-4 border border-gray-300 rounded">
              <h2 className="text-xl font-semibold mb-2">
                JSON Response from GPT:
              </h2>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {jsonResponse}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
