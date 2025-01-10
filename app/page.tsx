"use client";

import { useState } from "react";
import OpenAI from "openai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import { Input } from "@/components/ui/input";

// Define a more specific type for the response JSON structure
interface StepResponse {
  markdown: string;
  json: Record<string, unknown>;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [response, setResponse] = useState<string | Promise<string>>(""); // Changed type to string | null
  const [jsonResponse, setJsonResponse] = useState<string>(""); // Keeping this as string
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [machineName, setMachineName] = useState<string>("");

  const handleMachineNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMachineName(event.target.value);
  };

  const generateSteps = (machineName: string): string[] => {
    return [
      `Step 1: Provide a detailed breakdown of metals vs other materials for a ${machineName}, 6600 mm diameter. Include specific alloys, their properties, and why they're chosen. Present this information in a comprehensive table.`,
      `Step 2: Identify all components of the ${machineName} and provide an in-depth analysis of the chemical composition of metals used in each component. Include percentages of each element and explain their purpose. Present this in a detailed tabular form.`,
      `Step 3: Provide a comprehensive industry benchmark of weight distribution for each component. Compare this with the information from the previous step and explain any deviations in detail.`,
      `Step 4: Develop and explain a detailed empirical formula to identify weight proportionality for the ${machineName}. Include all variables and their significance.`,
      `Step 5: Provide detailed specifications of a commonly used ${machineName} with weight proportionality. Include all technical parameters, operating conditions, and performance metrics.`,
      `Step 6: Provide extensive real-life machine manufacturer examples for ${machineName}. Include detailed product specifications, pricing (if available), and direct links to product pages on 'makeinchina.com' and 'indiamart.com'. Compare these examples with the specifications provided in previous steps.`,
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
              "You are a highly knowledgeable assistant specializing in detailed technical analysis of industrial machinery. Provide extremely detailed responses in both markdown format and as a structured JSON object. The JSON object should contain all the key information from your response. Ensure that you include precise, in-depth specifics about each component, its materials, and relevant data. Always include comprehensive tables for better clarity. Your responses should be highly informative and contain all constituent details, including specific chemical compositions with percentages, material weights, industry benchmarks, and detailed explanations for each choice. When providing links to product pages, ensure they are as specific as possible to the machine being discussed.",
          },
          { role: "user", content: step },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const content =
        result.choices[0].message.content || "No response generated.";
      let jsonContent: Record<string, unknown> = {}; // Changed to a more specific type
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
    setResponse(""); // Setting response to null initially
    setJsonResponse("");
    const steps = generateSteps(machineName);

    let responseText = "";
    const jsonResponseObj: Record<string, Record<string, unknown>> = {}; // More specific type
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
            className="w-full mb-8"
          >
            {isLoading
              ? "Generating Detailed Analysis..."
              : "Generate In-Depth Analysis"}
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
