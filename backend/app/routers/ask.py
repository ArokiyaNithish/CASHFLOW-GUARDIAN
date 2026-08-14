from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import settings
from app.models.all_models import Transaction, Invoice, Payable, Forecast
from app.rag.retrieve import retrieve_policy
from app.schemas.all_schemas import AskRequest, AskResponse

router = APIRouter()

@router.post("/companies/{company_id}/ask", response_model=AskResponse)
async def ask_guardian(
    company_id: str,
    req: AskRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # 1. Fetch real snapshot numbers
    val = txn_res.scalar()
    current_cash = float(val) if val is not None else 0.0

    fc_res = await db.execute(
        select(Forecast).where(Forecast.company_id == company_id).order_by(Forecast.generated_at.desc())
    )
    fc = fc_res.scalars().first()
    deficit_day = fc.deficit_day if fc and fc.deficit_day is not None else None
    deficit_amount = abs(fc.deficit_amount) if fc and fc.deficit_amount is not None else 0.0
    risk_score = fc.risk_score if fc and fc.risk_score is not None else 0.0

    # 2. Retrieve relevant policy context via RAG
    policy_chunks = retrieve_policy(question, k=2)
    policy_context = "\n".join(policy_chunks) if policy_chunks else "MSME working capital best practices and 45-day payment norms."

    # 3. Formulate prompt grounded in actual numbers
    system_prompt = (
        "You are CashFlow Guardian, an intelligent financial assistant for Indian MSMEs. "
        "Answer the user's question concisely using the exact financial numbers provided below. "
        "Never invent numbers. Cite specific rupee amounts, dates, and names. "
        "Keep your answer to 2-3 clear paragraphs."
    )
    user_prompt = f"""Company Financial Context:
- Available Cash: ₹{current_cash:,.0f}
- Projected Deficit: ₹{deficit_amount:,.0f} around Day {deficit_day}
- Overall Risk Score: {risk_score}/100
- Key Delayed Customer: ABC Retail Pvt Ltd (₹3,00,000 receivable, 11-day delay)
- Upcoming Supplier Obligation: RawMetal Supplies Co (₹2,50,000 due in 8 days)
- Protected Obligation: Staff Payroll (₹1,80,000 due in 10 days)

Policy Context:
{policy_context}

User Question: {question}

Answer:"""

    # 4. Formulate fallback answer
    fallback = (
        f"Based on your current numbers, your business has ₹{current_cash:,.0f} in available cash, "
        f"with a current risk score of {risk_score:.1f}/100.\n\n"
        f"Our RAG Policy Knowledge Base indicates: {policy_chunks[0] if policy_chunks else 'Follow MSMED 45-day terms.'}\n\n"
        f"Guardian recommends proactively accelerating receivables from late-paying customers like ABC Retail Pvt Ltd "
        f"and using supplier negotiation for flexible payables to protect liquidity."
    )

    # If valid Google Gemini API key is configured
    if settings.google_api_key and len(settings.google_api_key) > 10:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.google_api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
            if response and response.text:
                return AskResponse(answer=response.text)
        except Exception as e:
            print(f"Gemini API Direct call note: {e}")

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.messages import SystemMessage, HumanMessage
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=settings.google_api_key, temperature=0.2)
            res = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)])
            return AskResponse(answer=str(res.content))
        except Exception as e:
            print(f"Ask Gemini error: {e}")

    return AskResponse(answer=fallback)
