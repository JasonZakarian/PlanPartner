[dbo].[Challenge_ProgressCalc](@userId int,@activityTypeId int,@startDate datetime2(7),@endDate datetime2(7),@goal int)
RETURNS  @temp TABLE (Progress int,DateFinished date,FinishTime datetime2(7))

AS

BEGIN

DECLARE @count int = 0
DECLARE @dayIterator int = 0

IF (@activityTypeId = 65 OR @activityTypeId = 136)
	BEGIN
		WHILE ((@count < @goal) AND @dayIterator < (SELECT DATEDIFF(day,@startDate,@endDate)))
			BEGIN
				IF (SELECT SUM(Contacts) From Activity WHERE UserId =@userId AND activityTypeId = @activityTypeId AND cast(StartTime as date) = cast(DATEADD(day,@dayIterator,@startDate)as date))is not null
					BEGIN
						SET @count = @count + (SELECT SUM(Contacts) From Activity WHERE UserId=154 AND cast(StartTime as date) = cast(DATEADD(day,@dayIterator,@startDate)as date))
					END
				IF @count < @goal
					BEGIN
						SET @dayIterator = @dayIterator +1
					END
			END
		 INSERT INTO @temp VALUES (@count, cast(DATEADD(day,@dayIterator,@startDate)as date),(SELECT TOP 1 EndTime FROM Activity WHERE UserId = @userId AND ActivityTypeId = @activityTypeId AND EndTime >=  DATEADD(day,@dayIterator,@startDate) ORDER BY StartTime))
	RETURN 
	END

ELSE IF (@activityTypeId = 64)
	BEGIN
		WHILE ((@count < @goal) AND @dayIterator < (SELECT DATEDIFF(day,@startDate,@endDate)))
			BEGIN
				IF (SELECT COUNT (ActivityTypeId) FROM Activity WHERE UserId = @userId AND ActivityTypeId = @activityTypeId AND cast(StartTime as date) = cast(DATEADD(day,@dayIterator,@startDate)as date)) is not null
					BEGIN
						SET @count = @count + (SELECT COUNT (ActivityTypeId) FROM Activity WHERE UserId = @userId AND ActivityTypeId = @activityTypeId AND cast(StartTime as date) = cast(DATEADD(day,@dayIterator,@startDate)as date))
					END
				IF @count < @goal
					BEGIN
						SET @dayIterator = @dayIterator +1
					END
			END
		INSERT INTO @temp VALUES (@count, cast(DATEADD(day,@dayIterator,@startDate)as date),(SELECT TOP 1 EndTime FROM Activity WHERE UserId = @userId AND ActivityTypeId = @activityTypeId AND EndTime >=  DATEADD(day,@dayIterator,@startDate) ORDER BY StartTime))
	END
	RETURN
END
