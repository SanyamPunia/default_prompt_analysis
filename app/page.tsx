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
      `Step 1: Provide a detailed bifurcation of metals versus other materials for the ${machineName}. **Present the weight distribution of metals vs other materials**. For example, for a 125 kVA diesel generator, the weight distribution might look like: 75-80% metals vs 20-25% other materials. **Ensure the output is presented in a tabular view only**, accurately classifying the materials used in the ${machineName}. List each material, specify their **weight distribution**, and provide the **chemical composition** for each material. For example:
    
    | Material       | Weight Distribution (%) | Chemical Composition (Major Elements)        |
    |----------------|-------------------------|----------------------------------------------|
    | Steel          | 60%                     | C - 0.9%, Mn - 1.0%, Fe - 98.1%             |
    | Aluminum       | 15%                     | Al - 99.5%, Si - 0.5%                       |
    | Copper         | 10%                     | Cu - 100%                                   |
    | Plastic        | 5%                      | C - 60%, H - 40%                            |
    | Rubber         | 5%                      | C - 85%, H - 15%                            |
    
    Ensure to include all significant materials used in the machine, providing precise breakdowns of their weight and composition.`,

      `Step 2: Identify and list all specific components of the ${machineName}, and provide a detailed **chemical composition of metals** used in each component. For example, components in a 125 kVA diesel generator could include the **alternator**, **engine casing**, **fuel tank**, **exhaust system**, and **control panel**. For each component, specify the **exact weight distribution** for each material and its **chemical composition**. Additionally, provide a breakdown of **sub-parts** within each component, specifying their material composition and weight distribution. 
    
    For example:
    
    | Component            | Sub-Part             | Weight Distribution (%) | Material         | Chemical Composition (Major Elements)           | Scrap Price (USD/MT) |
    |----------------------|----------------------|-------------------------|------------------|------------------------------------------------|----------------------|
    | Alternator           | Rotor                | 40%                     | Steel            | C - 0.9%, Mn - 1.0%, Fe - 98.1%                | $500                 |
    |                      | Stator               | 30%                     | Copper           | Cu - 100%                                        | $6,000               |
    |                      | Housing              | 30%                     | Aluminum         | Al - 99.5%, Si - 0.5%                           | $1,500               |
    | Engine Casing        | Casing               | 100%                    | Cast Iron        | Fe - 96%, C - 2%, Si - 1.5%                      | $350                 |
    | Fuel Tank            | Tank                 | 100%                    | Steel            | C - 0.9%, Mn - 1.0%, Fe - 98.1%                | $500                 |
    
    Ensure the weight distribution, chemical composition, and scrap prices are accurately provided for each component and sub-part. Present the output in **tabular form only**.`,

      `Step 3: Provide an **industry benchmark for weight distribution** of components and sub-parts for similar ${machineName}s (e.g., 125 kVA diesel generators). Compare the benchmarks with the data from Step 2 and identify any deviations in weight distribution. For example, the **engine casing** might be 18% in the industry benchmark, while Step 2 shows 20%. Ensure that **the total weight distribution of each component and sub-part adds up to 100%** in both the industry benchmark and the Step 2 data. If any discrepancies occur, correct them. 
    
    | Component            | Step 2 Weight Distribution (%) | Industry Benchmark (%) | Deviation (%) |
    |----------------------|-------------------------------|------------------------|---------------|
    | Alternator           | 30%                           | 32%                    | -2%           |
    | Engine Casing        | 20%                           | 18%                    | +2%           |
    | Fuel Tank            | 10%                           | 12%                    | -2%           |
    | Exhaust System       | 5%                            | 6%                     | -1%           |
    | Control Panel        | 5%                            | 4%                     | +1%           |
    
    Ensure that all deviations are clearly noted and ensure the weight distribution totals to 100% in both benchmarks and your data from Step 2. Present the output in **tabular form only**.`,

      `Step 4: Develop a **simplified empirical formula** to identify the weight proportionality for the ${machineName}. The formula should account for weight distribution and material composition for each component and sub-part. For example, the formula could be:
    
    **Formula Example**:  
    Weight Proportionality = (A * B) + (C * D) + (E * F)
    
    Where:  
    - A = Weight of Alternator  
    - B = Proportional factor for Alternator material (e.g., Steel = 0.60, Copper = 0.40)  
    - C = Weight of Engine Casing  
    - D = Proportional factor for Engine Casing material (e.g., Cast Iron = 1.0)  
    - E = Weight of Fuel Tank  
    - F = Proportional factor for Fuel Tank material (e.g., Steel = 1.0)  
    
    **Present the formula in tabular form** along with an explanation for each variable:
    
    | Variable | Description                      | Example  |
    |----------|----------------------------------|----------|
    | A        | Weight of Alternator             | 30%      |
    | B        | Proportional factor for Alternator | 0.60    |
    | C        | Weight of Engine Casing          | 20%      |
    | D        | Proportional factor for Engine Casing | 1.0   |
    | E        | Weight of Fuel Tank              | 10%      |
    | F        | Proportional factor for Fuel Tank | 1.0     |
    
    The formula should accurately reflect weight and material composition for the ${machineName}, ensuring the weight distribution is complete and accurate. Present this output in **tabular form only**.`,

      `Step 5: In a separate tabular output, provide an example of a commonly used machine in the same category as the ${machineName} and show its weight specifications proportional to industry standards. Include **exact technical parameters**, **operating conditions**, and **performance metrics** for this machine, alongside its weight distribution and chemical composition data. Ensure consistency with the weight distribution and formula developed in Step 4. For example:
    
    | Parameter          | Machine Specification  | Industry Standard |
    |--------------------|------------------------|-------------------|
    | Weight             | 500 kg                 | 520 kg            |
    | Power Output       | 125 kVA                | 130 kVA           |
    | Fuel Capacity      | 50 liters              | 55 liters         |
    | Operational Time   | 10 hours               | 12 hours          |
    
    Ensure the weight distribution and composition match the standards from Step 4. Present the output in **tabular form only**.`,

      `Step 6: Provide **real-life manufacturer examples** that support the weight distribution and specifications from Step 4. Include detailed product specifications, pricing (if available), and direct links to product pages from 'makeinchina.com' and 'indiamart.com'. For example, the real-life machine from the manufacturer could weigh "X" MT, with the specifications mentioned in Step 4. Extend the specifications by adding additional columns based on the weight-proportional parameters from Step 4. For example:
    
    | Manufacturer | Machine Model    | Weight (MT) | Specifications                         | Price (USD) | Product Link               |
    |--------------|------------------|-------------|----------------------------------------|-------------|----------------------------|
    | Company A    | Generator Model  | 0.50        | 125 kVA, 50 liters fuel tank, 10 hours  | $5,000      | [Link](https://example.com) |
    | Company B    | Generator Model  | 0.52        | 130 kVA, 55 liters fuel tank, 12 hours  | $5,200      | [Link](https://example.com) |
    
    Ensure the data is consistent with the weight distribution and formula from Step 4. Present the output in **tabular form only**, ensuring accuracy and completeness in all columns.`,
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
