from typing import Dict, Any
from app.agents.summarizer import summarizer_agent
from app.agents.guardrail import guardrail_agent

class AgenticPublishingPipeline:
    """
    End-to-end multi-agent ingestion pipeline that processes court documents,
    validates legal assertions, and assigns publishing route (Auto vs HITL).
    """
    
    def process(
        self,
        raw_text: str,
        court_name: str = "Supreme Court of India",
        auto_publish_enabled: bool = True,
        confidence_threshold: float = 0.95
    ) -> Dict[str, Any]:
        
        # Step 1: LLM Extraction & Dual-Mode Generation
        draft = summarizer_agent.process_judgment(raw_text=raw_text, court_name=court_name)
        
        # Step 2: Quality & Anti-Hallucination Guardrail Check
        is_valid, reason, confidence = guardrail_agent.validate(draft)
        draft["confidence_score"] = confidence
        
        # Step 3: Tri-Mode Publishing Router
        if auto_publish_enabled and is_valid and confidence >= confidence_threshold:
            draft["status"] = "PUBLISHED"
            draft["publish_mode"] = "AUTOMATED"
            draft["flag_reason"] = None
        else:
            draft["status"] = "IN_REVIEW"
            draft["publish_mode"] = "HITL"
            draft["flag_reason"] = reason if not is_valid or confidence < confidence_threshold else "Awaiting human editorial sign-off"
            
        return draft

pipeline = AgenticPublishingPipeline()
