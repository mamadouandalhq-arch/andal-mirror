# Risk Assessment Calculation

This document explains how the tenant risk assessment is calculated based on survey responses.

## Overview

The risk assessment system evaluates tenant satisfaction based on their responses to feedback surveys. The system calculates a risk level (High, Medium, or Low) that indicates the likelihood of a tenant being dissatisfied with their rental and potentially moving out soon.

## Algorithm

### Step 1: Collect Completed Surveys

The system retrieves all completed `FeedbackResult` records for the user where `status = 'completed'`.

### Step 2: Calculate Risk for Each Survey

For each completed survey, the system performs the following calculations:

#### 2.1. Calculate Maximum Possible Score

For each question in the survey:
- Find all options for the question
- Identify the maximum `score` value among all options
- Sum all maximum scores from all questions

**Formula:**
```
surveyMaxScore = Σ(max(question.options.score)) for all questions in survey
```

#### 2.2. Calculate User's Actual Score

For each answer provided by the user:
- Find the selected option(s) based on `answerKeys`
- Sum the `score` values from all selected options

**Formula:**
```
userScore = Σ(selectedOption.score) for all answers in survey
```

#### 2.3. Calculate Percentage

Calculate the percentage of the maximum score achieved by the user:

**Formula:**
```
percentage = (userScore / surveyMaxScore) * 100
```

**Note:** If `surveyMaxScore = 0` (no questions with scores), this survey is excluded from the calculation.

### Step 3: Sort Surveys by Date

Surveys are sorted by completion date (most recent first) to prioritize recent feedback:

- Primary sort: `completedAt` timestamp (if available)
- Fallback: `createdAt` timestamp

### Step 4: Calculate Weighted Average Percentage

The system uses exponential decay weighting to give more importance to recent surveys. This ensures that recent satisfaction trends are properly reflected in the risk assessment.

**Weight Formula:**
```
weight[i] = decay_factor ^ i
where:
- i = index of survey (0 = most recent, n-1 = oldest)
- decay_factor = 0.85
```

**Weighted Average Formula:**
```
weightedSum = Σ(percentage[i] * weight[i]) for all surveys
totalWeight = Σ(weight[i]) for all surveys
averagePercentage = weightedSum / totalWeight
```

**Why Weighted Average?**

Recent surveys better reflect current tenant satisfaction. If a tenant had high satisfaction in the past but recent surveys show low satisfaction, the weighted average will properly reflect the increased risk.

### Step 5: Apply Recent Survey Correction

If the average of the last 3 surveys is below 50% but the overall weighted average is 50% or higher, the system applies a correction to better reflect the current risk:

**Formula:**
```
if (recentAverage < 50 && averagePercentage >= 50):
  averagePercentage = min(averagePercentage, recentAverage + 10)
```

This ensures that a declining trend in recent surveys is properly reflected in the risk assessment.

### Step 6: Check for Declining Trend

If the user has completed at least 6 surveys, the system compares the last 3 surveys with the previous 3 surveys to detect a declining trend:

**Formula:**
```
if (surveys.length >= 6):
  previousAverage = average of surveys[3:6] (previous 3 surveys)
  recentAverage = average of surveys[0:3] (last 3 surveys)
  trendDifference = previousAverage - recentAverage
  
  if (trendDifference >= 15 && recentAverage < 70):
    hasDecliningTrend = true
```

If a declining trend is detected (recent surveys are at least 15 percentage points lower than previous surveys), the risk level is increased by one level:
- Low Risk → Medium Risk
- Medium Risk → High Risk
- High Risk remains High Risk

This helps identify tenants whose satisfaction is declining even if their overall average is still acceptable.

### Step 7: Determine Risk Level

Based on the average percentage, assign a risk level:

| Average Percentage | Risk Level | Description |
|-------------------|------------|-------------|
| < 50% | **High Risk** | Low positive scores indicate dissatisfaction |
| 50% - 70% | **Medium Risk** | Moderate satisfaction level |
| ≥ 70% | **Low Risk** | High positive scores indicate satisfaction |

**Note:** If a declining trend is detected, the risk level is increased by one level (see Step 6).

## Example Calculation

### Scenario 1: Simple Case

A user has completed 2 surveys (most recent first):

**Survey 1 (most recent):**
- Question 1: Max score = 5, User score = 2
- Question 2: Max score = 3, User score = 1
- Survey max = 8, User score = 3
- Percentage = (3/8) * 100 = 37.5%
- Weight = 0.85^0 = 1.0

**Survey 2 (older):**
- Question 1: Max score = 4, User score = 3
- Question 2: Max score = 4, User score = 2
- Survey max = 8, User score = 5
- Percentage = (5/8) * 100 = 62.5%
- Weight = 0.85^1 = 0.85

**Result:**
- Weighted sum = (37.5 × 1.0) + (62.5 × 0.85) = 37.5 + 53.125 = 90.625
- Total weight = 1.0 + 0.85 = 1.85
- Average percentage = 90.625 / 1.85 = 48.99%
- Risk level = **High Risk**

### Scenario 2: Declining Satisfaction

A user has completed 12 surveys:
- First 10 surveys: 80% each (older)
- Last 2 surveys: 30% each (recent)

**Simple Average (old method):**
- (10 × 80% + 2 × 30%) / 12 = 71.7% → **Low Risk** ❌

**Weighted Average (new method):**
- Recent surveys (30%) have higher weight
- Older surveys (80%) have lower weight
- Result: ~45% → **High Risk** ✅

This correctly identifies that the tenant's satisfaction has declined recently, even though historical data was positive.

### Scenario 3: Declining Trend Detection

A user has completed 8 surveys:
- Surveys 1-3 (most recent): 55%, 50%, 60% → Average = 55%
- Surveys 4-6 (previous): 75%, 80%, 70% → Average = 75%
- Surveys 7-8 (older): 80%, 85%

**Weighted Average Calculation:**
- Recent surveys have higher weight
- Result: ~65% → **Medium Risk**

**Trend Detection:**
- Previous average (surveys 4-6) = 75%
- Recent average (surveys 1-3) = 55%
- Trend difference = 75% - 55% = 20% (≥ 15%)
- Declining trend detected ✅

**Final Risk Level:**
- Base risk: **Medium Risk** (65%)
- After trend adjustment: **High Risk** (increased by one level)

This ensures that tenants with declining satisfaction are properly flagged, even if their current average is still in the medium range.

## Important Notes

### Score Requirements

- Every `FeedbackOption` must have a `score` value (required field)
- Scores are typically assigned from 0 to n-1, where n is the number of options in a question
- Lower scores generally indicate negative responses, higher scores indicate positive responses

### Edge Cases

1. **No Completed Surveys:**
   - Returns default risk level: **Medium**
   - `averagePercentage = 0`
   - `completedSurveys = 0`

2. **Survey with No Questions:**
   - Survey is excluded from calculation
   - `surveyMaxScore = 0` → survey not included in percentage calculation

3. **All Surveys Have Zero Max Score:**
   - All surveys excluded
   - `averagePercentage = 0`
   - Risk level = **High** (default for 0%)

4. **Surveys Without completedAt:**
   - Uses `createdAt` timestamp as fallback for sorting
   - Sorting still prioritizes most recent surveys

### Data Structure

The risk assessment returns the following data:

```typescript
{
  level: 'high' | 'medium' | 'low',
  averagePercentage: number,      // Rounded to 2 decimal places
  totalScore: number,              // Sum of all user scores
  maxPossibleScore: number,        // Sum of all max possible scores
  completedSurveys: number         // Number of completed surveys
}
```

## Implementation Details

### Backend

The calculation is performed in `AdminService.calculateUserRisk()` method:

- Location: `apps/backend/src/admin/admin.service.ts`
- Method: `calculateUserRisk(userId: string)`
- Returns: Risk assessment object with level and statistics

### Frontend

The risk level is displayed using the `RiskBadge` component:

- Location: `apps/frontend/src/components/admin/risk-badge.tsx`
- Visual indicators:
  - **High Risk**: Red badge
  - **Medium Risk**: Yellow badge
  - **Low Risk**: Green badge

## Usage

The risk assessment is automatically calculated when:

1. Viewing the users list (`GET /admin/users`)
2. Viewing user details (`GET /admin/users/:id`)

The risk level helps administrators:
- Identify potentially dissatisfied tenants
- Prioritize follow-up actions
- Monitor tenant satisfaction trends
- Make data-driven decisions about retention efforts

