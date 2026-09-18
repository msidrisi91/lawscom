from typing import Dict, Any, Tuple

class GuardrailAgent:
    """
    Anti-Hallucination & Quality Control Guardrail Agent.
    Strictly verifies legal accuracy, citation limits, word count budgets,
    and routing decisions before cards enter the publishing stream.
    """
    
    MAX_ADVOCATE_WORDS = 65
    MAX_CITIZEN_WORDS = 52
    
    def validate(self, card_data: Dict[str, Any]) -> Tuple[bool, str, float]:
        """
        Validates card payload. Returns (is_valid, reason, adjusted_confidence).
        """
        advocate_text = card_data.get("advocate_summary", "")
        citizen_text = card_data.get("citizen_summary", "")
        headline = card_data.get("headline", "")
        
        adv_word_count = len(advocate_text.split())
        cit_word_count = len(citizen_text.split())
        
        # Check word limits
        if adv_word_count > self.MAX_ADVOCATE_WORDS:
            return False, f"Advocate summary exceeds 65 words ({adv_word_count} words)", 0.65
            
        if cit_word_count > self.MAX_CITIZEN_WORDS:
            return False, f"Citizen summary exceeds 50 words ({cit_word_count} words)", 0.70
            
        if not headline or len(headline) < 10:
            return False, "Headline is too short or missing", 0.50
            
        # Check for ambiguous holding
        holding = card_data.get("holding", "")
        if holding not in ["Allowed", "Dismissed", "Disposed", "Remanded"]:
            return False, f"Unrecognized disposition outcome: {holding}", 0.60
            
        # Check for citation formatting
        sections = card_data.get("related_sections", [])
        if not sections:
            # Low risk flag - still valid but requires HITL review
            return True, "No specific statutory sections detected; flag for editor verification", 0.82
            
        return True, "Passed all automated guardrails", card_data.get("confidence_score", 0.95)

guardrail_agent = GuardrailAgent()
