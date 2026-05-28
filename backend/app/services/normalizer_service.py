class NormalizerService:

    @staticmethod
    def normalize_currency(currency: str):

        mapping = {
            "$": "USD",
            "usd": "USD",
            "dollar": "USD",
            "dollars": "USD",

            "€": "EUR",
            "eur": "EUR",

            "£": "GBP",
            "gbp": "GBP"
        }

        normalized = mapping.get(
            currency.lower(),
            currency.upper()
        )

        return normalized