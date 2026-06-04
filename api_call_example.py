import os

from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential


def create_client() -> ChatCompletionsClient:
    github_pat = os.environ["GITHUB_PAT"]
    endpoint = "https://models.github.ai/inference"

    return ChatCompletionsClient(
        endpoint=endpoint,
        credential=AzureKeyCredential(github_pat),
    )


def main() -> None:
    model = "openai/gpt-5"
    client = create_client()

    response = client.complete(
        messages=[
            SystemMessage("You answer briefly and directly."),
            UserMessage("What are the most popular washing machine in the US from Samsung?"),
        ],
        model=model,
    )

    print(response.choices[0].message.content)

    follow_up = client.complete(
        messages=[
            SystemMessage("You answer briefly and directly."),
            UserMessage("What are the next 3 questions that we have to do?"),
        ],
        model=model,
    )

    print("\nNext 3 questions:")
    print(follow_up.choices[0].message.content)


if __name__ == "__main__":
    main()