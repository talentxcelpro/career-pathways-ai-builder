import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const headers = {
  "Authorization": `Bearer ${OPENAI_API_KEY}`,
  "OpenAI-Beta": "realtime=v1"
};

export default {
  async fetch(request: Request) {
    console.log("🎤 Starting realtime career coach session");
    
    if (!OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found");
      return new Response("OpenAI API key not configured", { status: 500 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = async () => {
      console.log("🔌 WebSocket connection opened with client");
      
      try {
        // Connect to OpenAI Realtime API
        const openaiWs = new WebSocket(
          "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
          { headers }
        );

        let sessionCreated = false;

        openaiWs.onopen = () => {
          console.log("✅ Connected to OpenAI Realtime API");
        };

        openaiWs.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("📨 OpenAI message type:", data.type);

          // Send session update after session is created
          if (data.type === 'session.created' && !sessionCreated) {
            sessionCreated = true;
            console.log("🎯 Session created, sending configuration");
            
            const sessionUpdate = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: `You are an expert AI Career Coach with deep knowledge across all industries, roles, and career development strategies. Your role is to provide personalized, actionable career guidance that helps professionals achieve their goals.

Key capabilities:
- Career transition planning and strategy
- Salary negotiation techniques and market insights  
- Leadership development and skill building
- Industry trend analysis and future planning
- Interview preparation and job search optimization
- Personal branding and networking strategies
- Work-life balance and career satisfaction

Guidelines:
- Provide specific, actionable advice rather than generic suggestions
- Ask clarifying questions when needed to give better guidance
- Offer multiple perspectives and options when appropriate
- Include relevant industry insights and market trends
- Suggest concrete next steps and timelines
- Be encouraging while being realistic about challenges
- Tailor advice to the user's experience level and goals
- Keep responses conversational and engaging for voice chat
- Speak in a warm, professional, and supportive tone

Remember: You're actively coaching someone's career development through natural conversation.`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                tools: [
                  {
                    type: "function",
                    name: "get_career_insights",
                    description: "Get personalized career insights and recommendations for the user",
                    parameters: {
                      type: "object",
                      properties: {
                        topic: { type: "string", description: "The career topic to provide insights on" },
                        user_context: { type: "string", description: "User's current situation or context" }
                      },
                      required: ["topic"]
                    }
                  },
                  {
                    type: "function", 
                    name: "analyze_market_trends",
                    description: "Analyze current market trends for specific industries or roles",
                    parameters: {
                      type: "object",
                      properties: {
                        industry: { type: "string", description: "The industry to analyze" },
                        role: { type: "string", description: "Specific role to focus on" }
                      },
                      required: ["industry"]
                    }
                  }
                ],
                tool_choice: "auto",
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            
            openaiWs.send(JSON.stringify(sessionUpdate));
            console.log("📤 Session update sent");
          }

          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            console.log("🔧 Function call:", data.name, data.arguments);
            
            let result = "";
            if (data.name === 'get_career_insights') {
              const args = JSON.parse(data.arguments);
              result = `Based on current market analysis for ${args.topic}, here are key insights: Focus on developing both technical and soft skills, particularly in areas like AI literacy, emotional intelligence, and adaptability. The job market is increasingly favoring candidates who can demonstrate continuous learning and cross-functional collaboration.`;
            } else if (data.name === 'analyze_market_trends') {
              const args = JSON.parse(data.arguments);
              result = `Market analysis for ${args.industry}: Strong growth projected, with increasing demand for ${args.role || 'skilled professionals'}. Remote and hybrid work options continue to expand. Key trends include AI integration, sustainability focus, and emphasis on data-driven decision making.`;
            }

            // Send function result back to OpenAI
            const functionResult = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: data.call_id,
                output: result
              }
            };
            
            openaiWs.send(JSON.stringify(functionResult));
            openaiWs.send(JSON.stringify({ type: "response.create" }));
          }

          // Forward all messages to client
          socket.send(JSON.stringify(data));
        };

        openaiWs.onerror = (error) => {
          console.error("❌ OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ 
            type: "error", 
            message: "Connection to AI service failed" 
          }));
        };

        openaiWs.onclose = () => {
          console.log("🔌 OpenAI WebSocket closed");
          socket.close();
        };

        // Forward client messages to OpenAI
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("📨 Client message type:", data.type);
          openaiWs.send(event.data);
        };

        socket.onclose = () => {
          console.log("🔌 Client WebSocket closed");
          openaiWs.close();
        };

      } catch (error) {
        console.error("❌ Error setting up WebSocket:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          message: "Failed to initialize voice chat" 
        }));
      }
    };

    return response;
  }
};