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

### Step 3: Calculate Average Percentage

If the user has completed multiple surveys, calculate the average percentage across all surveys:

**Formula:**
```
averagePercentage = Σ(percentage) / number_of_surveys
```

### Step 4: Determine Risk Level

Based on the average percentage, assign a risk level:

| Average Percentage | Risk Level | Description |
|-------------------|------------|-------------|
| < 50% | **High Risk** | Low positive scores indicate dissatisfaction |
| 50% - 70% | **Medium Risk** | Moderate satisfaction level |
| ≥ 70% | **Low Risk** | High positive scores indicate satisfaction |

## Example Calculation

### Scenario

A user has completed 2 surveys:

**Survey 1:**
- Question 1: Max score = 5, User score = 2
- Question 2: Max score = 3, User score = 1
- Survey max = 8, User score = 3
- Percentage = (3/8) * 100 = 37.5%

**Survey 2:**
- Question 1: Max score = 4, User score = 3
- Question 2: Max score = 4, User score = 2
- Survey max = 8, User score = 5
- Percentage = (5/8) * 100 = 62.5%

**Result:**
- Average percentage = (37.5 + 62.5) / 2 = 50%
- Risk level = **Medium Risk**

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

