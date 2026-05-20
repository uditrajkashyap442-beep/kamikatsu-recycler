package com.kamikatsu.api.service;

import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class HeuristicClassifier {

    public static class ClassificationResult {
        public final String name;
        public final String description;
        public final String categoryCode;
        public final String classification; // recyclable, compostable, reusable, hazardous
        public final String costStatus; // free, paid, donation
        public final String preparationSteps;

        public ClassificationResult(String name, String description, String categoryCode, String classification, String costStatus, String preparationSteps) {
            this.name = name;
            this.description = description;
            this.categoryCode = categoryCode;
            this.classification = classification;
            this.costStatus = costStatus;
            this.preparationSteps = preparationSteps;
        }
    }

    public ClassificationResult classify(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        String q = query.toLowerCase(Locale.ROOT).trim();

        // 1. PET Bottles
        if (q.contains("pet") || q.contains("ペット") || q.contains("飲料のボトル")) {
            return new ClassificationResult(
                query,
                "PET plastic beverage bottle / ペットボトル",
                "PL01",
                "recyclable",
                "free",
                "1. Empty and rinse the bottle thoroughly.\n2. Remove the plastic cap and label (these go to general plastics PL02).\n3. Flatten the bottle before placing in the bin."
            );
        }

        // 2. Cardboard
        if (q.contains("cardboard") || q.contains("corrugated") || q.contains("ダンボール") || q.contains("段ボール")) {
            return new ClassificationResult(
                query,
                "Cardboard boxes / 段ボール",
                "CB01",
                "recyclable",
                "free",
                "1. Flatten cardboard boxes completely.\n2. Remove all plastic tape, staples, and labels.\n3. Tie with paper twine in bundles."
            );
        }

        // 3. Steel Cans
        if (q.contains("steel can") || q.contains("iron can") || q.contains("スチール缶") || q.contains("鉄缶") || q.contains("缶詰")) {
            return new ClassificationResult(
                query,
                "Steel can / スチール缶",
                "MT01",
                "recyclable",
                "free",
                "1. Rinse the inside of the can thoroughly.\n2. Do not flatten steel cans.\n3. Separate from aluminum cans."
            );
        }

        // 4. Aluminum Cans / Foil
        if (q.contains("aluminum") || q.contains("aluminium") || q.contains("アルミ") || q.contains("ビール缶") || q.contains("ソーダ缶")) {
            return new ClassificationResult(
                query,
                "Aluminum can or foil / アルミ缶・アルミ箔",
                "MT02",
                "recyclable",
                "free",
                "1. Rinse the inside of the can thoroughly.\n2. Flatten the can if possible.\n3. Place in the aluminum recycling bin."
            );
        }

        // 5. Clear Glass Bottles
        if (q.contains("clear glass") || q.contains("透明ガラス") || q.contains("透明な瓶") || q.equals("びん") || q.equals("瓶")) {
            return new ClassificationResult(
                query,
                "Clear glass bottle / 透明な瓶",
                "GL01",
                "recyclable",
                "free",
                "1. Remove lids, caps, and corks.\n2. Rinse inside thoroughly.\n3. Place in the transparent glass bin."
            );
        }

        // 6. Colored Glass Bottles
        if (q.contains("glass") || q.contains("colored glass") || q.contains("ガラス") || q.contains("瓶") || q.contains("ビン")) {
            return new ClassificationResult(
                query,
                "Colored glass bottle / 色付きの瓶",
                "GL02",
                "recyclable",
                "free",
                "1. Remove lids, caps, and corks.\n2. Rinse inside thoroughly.\n3. Separate by color (brown vs. others) into designated bins."
            );
        }

        // 7. General Plastics / Wrap / HDPE
        if (q.contains("plastic") || q.contains("hdpe") || q.contains("プラスチック") || q.contains("プラ") || q.contains("袋") || q.contains("ラップ") || q.contains("トレイ") || q.contains("容器") || q.contains("洗剤")) {
            return new ClassificationResult(
                query,
                "General plastic packaging/container / プラスチック製容器包装",
                "PL02",
                "recyclable",
                "free",
                "1. Clean off any food residue or contents.\n2. Dry completely.\n3. Place in the designated plastics bag. Dirty plastic must go to combustibles."
            );
        }

        // Paper Milk Cartons (Tetra Pak / Milk carton)
        if (q.contains("carton") || q.contains("パック") || q.contains("牛乳パック") || q.contains("milk") || q.contains("amul") || q.contains("テトラ")) {
            return new ClassificationResult(
                query,
                "Paper Milk Carton / 牛乳パック",
                "CB02",
                "recyclable",
                "free",
                "1. Rinse the inside of the milk carton thoroughly.\n2. Cut the carton open and flatten it.\n3. Let it dry completely in the sun.\n4. Bundle together with other paper milk cartons."
            );
        }

        // 8. Newspaper / Paper
        if (q.contains("newspaper") || q.contains("paper") || q.contains("紙") || q.contains("新聞") || q.contains("雑誌") || q.contains("本") || q.contains("書類")) {
            return new ClassificationResult(
                query,
                "Paper waste or newspapers / 紙類・新聞",
                "CB02",
                "recyclable",
                "free",
                "1. Separate newspapers, magazines, and general paper.\n2. Bundle neatly and tie with twine.\n3. Keep dry."
            );
        }

        // 9. Food Waste
        if (q.contains("food") || q.contains("scrap") || q.contains("garbage") || q.contains("waste") || q.contains("生ごみ") || q.contains("生ゴミ") || q.contains("食品くず") || q.contains("野菜") || q.contains("残飯")
            || q.contains("banana") || q.contains("apple") || q.contains("orange") || q.contains("fruit") || q.contains("meat") || q.contains("fish") || q.contains("bread") || q.contains("rice") || q.contains("egg") || q.contains("バナナ") || q.contains("りんご") || q.contains("みかん") || q.contains("果物")) {
            return new ClassificationResult(
                query,
                "Food waste / 生ごみ",
                "FS01",
                "compostable",
                "free",
                "1. Drain all excess water from the food waste.\n2. Compost at home using the electric composter if available.\n3. Avoid bringing liquid or high-moisture waste to the station."
            );
        }

        // 10. Leaves & Garden Waste
        if (q.contains("leaf") || q.contains("leaves") || q.contains("grass") || q.contains("plant") || q.contains("葉") || q.contains("落ち葉") || q.contains("草") || q.contains("植物")) {
            return new ClassificationResult(
                query,
                "Garden leaves and plants / 落ち葉・雑草",
                "GD01",
                "compostable",
                "free",
                "1. Collect leaves and grass in designated paper or net bags.\n2. Ensure no plastic or stone items are mixed in."
            );
        }

        // 11. Wood & Bamboo
        if (q.contains("wood") || q.contains("branch") || q.contains("bamboo") || q.contains("木") || q.contains("竹") || q.contains("枝") || q.contains("箸")) {
            return new ClassificationResult(
                query,
                "Wood pieces or branches / 木くず・枝",
                "WD01",
                "recyclable",
                "free",
                "1. Cut branches to lengths under 50cm.\n2. Bundle together securely with twine.\n3. Keep dry."
            );
        }

        // 12. Ceramics / Plates / Bowls
        if (q.contains("ceramic") || q.contains("plate") || q.contains("bowl") || q.contains("pottery") || q.contains("陶器") || q.contains("皿") || q.contains("コップ")) {
            return new ClassificationResult(
                query,
                "Ceramics and pottery / 陶器類",
                "CR01",
                "recyclable",
                "free",
                "1. Wrap breakable plates and bowls in newspaper.\n2. Clearly write 'Broken/Ceramic' on the bag if shattered.\n3. Dispose of in the designated ceramics box."
            );
        }

        // 13. Porcelain
        if (q.contains("porcelain") || q.contains("磁器")) {
            return new ClassificationResult(
                query,
                "Porcelain dinnerware / 磁器類",
                "CR02",
                "recyclable",
                "free",
                "1. Wrap carefully in newspaper.\n2. Place in the porcelain collection bin."
            );
        }

        // 14. Rubber
        if (q.contains("rubber") || q.contains("tire") || q.contains("ゴム") || q.contains("タイヤ")) {
            return new ClassificationResult(
                query,
                "Rubber items / ゴム製品",
                "RB01",
                "recyclable",
                "free",
                "1. Bundle or place in the designated rubber bin.\n2. Ensure any metal fittings are removed if possible."
            );
        }

        // 15. Leather
        if (q.contains("leather") || q.contains("革") || q.contains("皮") || q.contains("レザー")) {
            return new ClassificationResult(
                query,
                "Leather goods / 皮革製品",
                "LE01",
                "recyclable",
                "free",
                "1. Remove metallic buckles, zippers, and hard parts where possible.\n2. Clean off heavy dirt."
            );
        }

        // 16. Cotton Textiles
        if (q.contains("cotton") || q.contains("shirt") || q.contains("服") || q.contains("綿") || q.contains("衣類") || q.contains("衣")) {
            return new ClassificationResult(
                query,
                "Cotton clothing and textiles / 綿製衣類",
                "TX01",
                "reusable",
                "free",
                "1. Wash and dry the clothing completely.\n2. Fold neatly and place in a clear plastic bag to protect from rain."
            );
        }

        // 17. Mixed Textiles
        if (q.contains("textile") || q.contains("polyester") || q.contains("blend") || q.contains("繊維") || q.contains("洋服") || q.contains("布")) {
            return new ClassificationResult(
                query,
                "Mixed synthetic textiles / 繊維・衣類",
                "TX02",
                "reusable",
                "free",
                "1. Wash and dry before disposal.\n2. Place in a clear bag to keep dry."
            );
        }

        // 18. Pamphlets
        if (q.contains("pamphlet") || q.contains("flyer") || q.contains("brochure") || q.contains("パンフレット") || q.contains("チラシ")) {
            return new ClassificationResult(
                query,
                "Pamphlets and flyers / パンフレット・チラシ",
                "PD01",
                "recyclable",
                "free",
                "1. Stack pamphlets and flyers neatly.\n2. Tie together or place in paper bags. Do not mix with plastic wrappers."
            );
        }

        return null;
    }
}
