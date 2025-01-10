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
      `Step 1: Provide a detailed breakdown of metals vs other materials for the ${machineName}. Include the weight distribution of metals versus other materials, similar to how the weight distribution of metals vs other materials is for a Tunnel Boring Machine (e.g., 80-85% metals vs 10-15% other materials). Present this information in a comprehensive table.`,

      `Step 2: Identify all components of the ${machineName} and provide an in-depth analysis of the chemical composition of metals used in each component. Include the weight distribution for each component (e.g., Cutter Head System, Shield, etc.), and provide the exact percentages for each metal. Present the data in a detailed tabular form. Also, include another column with the sub-parts of each component, their respective weight-wise distribution, and the chemical composition of each sub-part (e.g., Disc Cutters made of Tool Steel, comprising 15% of the weight). Add additional columns indicating the scrap price per metric ton for each material used.`,

      `Step 3: Provide an industry benchmark for weight distribution of the components and their sub-parts, and compare these benchmarks with the information from Step 2. Identify any deviations in weight distribution. Ensure the total weight distribution for each component and sub-part adds up to 100%. For example, if the weight distribution for the Frame Structure in Step 2 is 20%, but the industry benchmark shows 22%, highlight the deviation and correct the weight distribution accordingly.`,

      `Step 4: Develop a simplified empirical formula that can be used to identify the weight proportionality for the ${machineName}. Present the formula in a plain text format (e.g., "Weight Proportionality = X * Y + Z"), ensuring that it uses only symbols to maintain clarity. Include all the relevant variables and explain their significance in terms of weight distribution.`,

      `Step 5: In another tabular output, provide an example of a commonly used machine in the same category as the ${machineName}, showing its weight and exact specifications. These specifications should be proportional to the weight based on industry standards. Include all relevant technical parameters, operating conditions, and performance metrics for this machine.`,

      `Step 6: Provide real-life machine manufacturer examples that support the weight and specifications from Step 4. Include detailed product specifications, pricing (if available), and direct links to product pages on 'makeinchina.com' and 'indiamart.com'. Compare these real-life examples with the specifications and weight distribution mentioned in previous steps. Extend the specifications by adding additional columns where needed, based on the number of weight-proportional parameters from Step 4.`,
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
        max_tokens: 4000,
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
